import json
import asyncio
import websockets
import requests
from flask import Flask, request, jsonify
import logging
import threading
import time
import os
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("mcp_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("GaodeMCPServer")

# 初始化Flask应用
app = Flask(__name__)

# 配置信息
CONFIG = {
    "deepseek_api_key": "sk-e120c0aae8074a368d26fff5136a83fd",
    "deepseek_api_url": "https://api.deepseek.com/v1/chat/completions",
    "amap_key": "206278d547a0c6408987f2a0002e2243",
    "amap_api_base": "https://restapi.amap.com/v3",
    "websocket_port": 6789,
    "http_port": 5000,
    "max_connections": 100,
    "connection_timeout": 300,  # 5分钟超时
}

# 存储活跃连接
active_connections = {}

# DeepSeek API调用函数
def call_deepseek_api(prompt, system_message=""):
    try:
        headers = {
            "Authorization": f"Bearer {CONFIG['deepseek_api_key']}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": system_message if system_message else "你是一个高德地图数据处理专家，提供精准的地理信息分析和导航建议。"},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3
        }
        
        response = requests.post(
            CONFIG["deepseek_api_url"],
            headers=headers,
            json=payload,
            timeout=30
        )
        
        response_data = response.json()
        if "choices" in response_data and len(response_data["choices"]) > 0:
            return response_data["choices"][0]["message"]["content"]
        else:
            logger.error(f"DeepSeek API返回异常: {response_data}")
            return None
    except Exception as e:
        logger.error(f"调用DeepSeek API出错: {str(e)}")
        return None

# 高德地图API调用函数
def call_amap_api(endpoint, params):
    try:
        # 添加公共参数
        params["key"] = CONFIG["amap_key"]
        params["output"] = "json"
        
        url = f"{CONFIG['amap_api_base']}/{endpoint}"
        logger.info(f"调用高德API: {url}, 参数: {params}")
        response = requests.get(url, params=params, timeout=10)
        
        # 检查HTTP状态码
        response.raise_for_status()
        
        result = response.json()
        logger.info(f"高德API返回: 状态={result.get('status', 'unknown')}")
        return result
    except requests.exceptions.RequestException as e:
        logger.error(f"调用高德地图API网络错误: {str(e)}")
        return {"status": "0", "info": f"API网络错误: {str(e)}"}
    except Exception as e:
        logger.error(f"调用高德地图API出错: {str(e)}")
        return {"status": "0", "info": f"API调用失败: {str(e)}"}

# 处理各种MCP请求的函数
class MCPHandler:
    @staticmethod
    def handle_search_poi(params):
        """POI搜索"""
        amap_result = call_amap_api("place/text", params)
        
        # 使用DeepSeek增强搜索结果
        if amap_result.get("status") == "1" and "pois" in amap_result:
            prompt = f"""
            基于以下高德地图POI搜索结果，提供更详细的分析:
            关键词: {params.get('keywords', '')}
            城市: {params.get('city', '')}
            搜索结果: {json.dumps(amap_result['pois'][:3], ensure_ascii=False)}
            
            请分析这些地点的特点、周边环境、适合人群等信息，并给出选择建议。
            """
            enhanced_info = call_deepseek_api(prompt)
            if enhanced_info:
                amap_result["enhanced_info"] = enhanced_info
        
        return amap_result
    
    @staticmethod
    def handle_route_planning(params):
        """路线规划"""
        try:
            # 检查参数格式，如果不是经纬度坐标格式，尝试将城市名转换为坐标
            origin = params.get('origin', '')
            destination = params.get('destination', '')
            
            # 去除可能存在的前后空格
            origin = origin.strip()
            destination = destination.strip()
            
            # 简单判断是否为经纬度格式（包含逗号且两边都是数字）
            if not (origin.replace('.', '').replace('-', '').replace(',', '').isdigit() and ',' in origin):
                # 尝试将城市名转换为经纬度
                logger.info(f"尝试将城市名 '{origin}' 转换为坐标")
                geocode_params = {"address": origin, "city": "全国"}
                geocode_result = call_amap_api("geocode/geo", geocode_params)
                
                if geocode_result.get("status") == "1" and geocode_result.get("geocodes") and len(geocode_result["geocodes"]) > 0:
                    origin = geocode_result["geocodes"][0]["location"]
                    logger.info(f"城市名 '{params.get('origin')}' 转换为坐标: {origin}")
                else:
                    return {"status": "0", "info": f"无法将起点 '{params.get('origin')}' 转换为坐标"}
            
            if not (destination.replace('.', '').replace('-', '').replace(',', '').isdigit() and ',' in destination):
                # 尝试将城市名转换为经纬度
                logger.info(f"尝试将城市名 '{destination}' 转换为坐标")
                geocode_params = {"address": destination, "city": "全国"}
                geocode_result = call_amap_api("geocode/geo", geocode_params)
                
                if geocode_result.get("status") == "1" and geocode_result.get("geocodes") and len(geocode_result["geocodes"]) > 0:
                    destination = geocode_result["geocodes"][0]["location"]
                    logger.info(f"城市名 '{params.get('destination')}' 转换为坐标: {destination}")
                else:
                    return {"status": "0", "info": f"无法将终点 '{params.get('destination')}' 转换为坐标"}
            
            # 更新参数
            params_copy = params.copy()
            params_copy["origin"] = origin
            params_copy["destination"] = destination
            
            # 调用高德API
            amap_result = call_amap_api("direction/driving", params_copy)
            
            # 使用DeepSeek分析路线
            if amap_result.get("status") == "1" and "route" in amap_result:
                prompt = f"""
                分析以下高德地图路线规划结果:
                起点: {params.get('origin', '')}
                终点: {params.get('destination', '')}
                路线信息: {json.dumps(amap_result['route'], ensure_ascii=False)}
                
                请提供路线分析，包括预计拥堵情况、最佳出行时间建议、路线特点分析等。
                """
                route_analysis = call_deepseek_api(prompt)
                if route_analysis:
                    amap_result["route_analysis"] = route_analysis
            
            return amap_result
        except Exception as e:
            logger.error(f"路线规划处理错误: {str(e)}")
            return {"status": "0", "info": f"路线规划处理错误: {str(e)}"}
    
    @staticmethod
    def handle_geocode(params):
        """地理编码"""
        amap_result = call_amap_api("geocode/geo", params)
        return amap_result
    
    @staticmethod
    def handle_regeocode(params):
        """逆地理编码"""
        amap_result = call_amap_api("geocode/regeo", params)
        return amap_result
    
    @staticmethod
    def handle_weather(params):
        """天气查询"""
        amap_result = call_amap_api("weather/weatherInfo", params)
        
        # 使用DeepSeek提供天气建议
        if amap_result.get("status") == "1" and "lives" in amap_result:
            weather_data = amap_result["lives"][0]
            prompt = f"""
            基于以下高德地图天气数据，提供出行建议:
            城市: {weather_data.get('city', '')}
            天气: {weather_data.get('weather', '')}
            温度: {weather_data.get('temperature', '')}°C
            风力: {weather_data.get('windpower', '')}
            湿度: {weather_data.get('humidity', '')}%
            
            请根据这些天气数据，给出今日出行建议、穿衣建议、活动建议等。
            """
            weather_advice = call_deepseek_api(prompt)
            if weather_advice:
                amap_result["weather_advice"] = weather_advice
        
        return amap_result
    
    @staticmethod
    def handle_district(params):
        """行政区域查询"""
        amap_result = call_amap_api("config/district", params)
        return amap_result
    
    @staticmethod
    def handle_traffic_status(params):
        """交通态势"""
        amap_result = call_amap_api("traffic/status/rectangle", params)
        
        # 使用DeepSeek分析交通状况
        if amap_result.get("status") == "1" and "trafficinfo" in amap_result:
            prompt = f"""
            分析以下高德地图交通态势数据:
            区域: {params.get('rectangle', '')}
            交通信息: {json.dumps(amap_result['trafficinfo'], ensure_ascii=False)}
            
            请提供交通状况分析，包括拥堵原因推测、避堵路线建议等。
            """
            traffic_analysis = call_deepseek_api(prompt)
            if traffic_analysis:
                amap_result["traffic_analysis"] = traffic_analysis
        
        return amap_result

# WebSocket处理
async def websocket_handler(websocket):
    client_id = f"client_{int(time.time() * 1000)}"
    
    try:
        active_connections[client_id] = {
            "websocket": websocket,
            "last_active": time.time()
        }
        
        logger.info(f"新客户端连接: {client_id}, 远程地址: {websocket.remote_address}")
        
        # 发送欢迎消息
        await websocket.send(json.dumps({
            "type": "connection_established",
            "client_id": client_id,
            "message": "已连接到高德地图MCP服务器"
        }))
        
        # 保持连接并处理消息
        async for message in websocket:
            active_connections[client_id]["last_active"] = time.time()
            
            try:
                data = json.loads(message)
                request_type = data.get("type", "")
                params = data.get("params", {})
                request_id = data.get("request_id", "")
                
                # 根据请求类型调用不同的处理函数
                result = None
                if request_type == "search_poi":
                    result = MCPHandler.handle_search_poi(params)
                elif request_type == "route_planning":
                    result = MCPHandler.handle_route_planning(params)
                elif request_type == "geocode":
                    result = MCPHandler.handle_geocode(params)
                elif request_type == "regeocode":
                    result = MCPHandler.handle_regeocode(params)
                elif request_type == "weather":
                    result = MCPHandler.handle_weather(params)
                elif request_type == "district":
                    result = MCPHandler.handle_district(params)
                elif request_type == "traffic_status":
                    result = MCPHandler.handle_traffic_status(params)
                else:
                    result = {"status": "0", "info": "不支持的请求类型"}
                
                # 发送响应
                response = {
                    "type": "response",
                    "request_type": request_type,
                    "request_id": request_id,
                    "data": result,
                    "timestamp": datetime.now().isoformat()
                }
                
                await websocket.send(json.dumps(response))
                logger.info(f"已处理客户端 {client_id} 的 {request_type} 请求")
                
            except json.JSONDecodeError:
                logger.error(f"客户端 {client_id} 发送了无效的JSON")
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "无效的JSON格式"
                }))
            except Exception as e:
                logger.error(f"处理客户端 {client_id} 消息时出错: {str(e)}")
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": f"服务器处理错误: {str(e)}"
                }))
    
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"客户端 {client_id} 断开连接")
    finally:
        if client_id in active_connections:
            del active_connections[client_id]

# 定期清理超时连接
async def cleanup_connections():
    while True:
        current_time = time.time()
        to_remove = []
        
        for client_id, info in active_connections.items():
            if current_time - info["last_active"] > CONFIG["connection_timeout"]:
                to_remove.append(client_id)
        
        for client_id in to_remove:
            try:
                await active_connections[client_id]["websocket"].close()
                logger.info(f"关闭超时客户端: {client_id}")
            except:
                pass
            del active_connections[client_id]
        
        await asyncio.sleep(60)  # 每分钟检查一次

# HTTP API路由
@app.route('/api/v1/mcp/<action>', methods=['GET', 'POST'])
def mcp_api(action):
    try:
        # 获取请求参数
        if request.method == 'GET':
            params = request.args.to_dict()
        else:
            params = request.json if request.is_json else request.form.to_dict()
        
        # 根据action调用相应的处理函数
        if action == "search_poi":
            result = MCPHandler.handle_search_poi(params)
        elif action == "route_planning":
            result = MCPHandler.handle_route_planning(params)
        elif action == "geocode":
            result = MCPHandler.handle_geocode(params)
        elif action == "regeocode":
            result = MCPHandler.handle_regeocode(params)
        elif action == "weather":
            result = MCPHandler.handle_weather(params)
        elif action == "district":
            result = MCPHandler.handle_district(params)
        elif action == "traffic_status":
            result = MCPHandler.handle_traffic_status(params)
        else:
            return jsonify({"status": "0", "info": "不支持的API操作"})
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"API处理出错: {str(e)}")
        return jsonify({"status": "0", "info": f"服务器处理错误: {str(e)}"})

@app.route('/api/v1/status', methods=['GET'])
def server_status():
    return jsonify({
        "status": "1",
        "active_connections": len(active_connections),
        "server_time": datetime.now().isoformat(),
        "server_version": "1.0.0"
    })

# 启动服务器
async def start_server():
    # 启动WebSocket服务器
    stop = asyncio.Future()
    ws_server = await websockets.serve(
        websocket_handler, 
        "0.0.0.0", 
        CONFIG["websocket_port"],
        max_size=10485760  # 10MB最大消息大小
    )
    
    # 启动连接清理任务
    cleanup_task = asyncio.create_task(cleanup_connections())
    
    logger.info(f"WebSocket服务器已启动，监听端口 {CONFIG['websocket_port']}")
    
    # 保持服务器运行
    await stop
    
    # 清理
    cleanup_task.cancel()
    ws_server.close()
    await ws_server.wait_closed()

# 启动Flask HTTP服务器
def run_flask_app():
    app.run(host="0.0.0.0", port=CONFIG["http_port"], debug=False)

# 主函数
def main():
    logger.info("启动高德地图MCP服务器...")
    
    # 检查配置
    if not CONFIG["amap_key"]:
        logger.error("未配置高德地图API密钥，服务将无法正常工作")
    
    if not CONFIG["deepseek_api_key"]:
        logger.error("未配置DeepSeek API密钥，智能增强功能将不可用")
    
    try:
        # 启动Flask HTTP服务器（在单独的线程中）
        flask_thread = threading.Thread(target=run_flask_app)
        flask_thread.daemon = True
        flask_thread.start()
        logger.info(f"HTTP服务器已启动，监听端口 {CONFIG['http_port']}")
        
        # 启动WebSocket服务器（在主线程中）
        asyncio.run(start_server())
    except Exception as e:
        logger.error(f"服务器启动失败: {str(e)}")
        exit(1)

if __name__ == "__main__":
    main()