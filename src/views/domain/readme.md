为每个功能创建了独立的应用页面，并使用BasePage作为基础组件提供页面结构和底部的CtaSection组件。每个功能页面现在都有自己的布局和内容区域，可以根据具体需求进行定制化实现。
主要完成的工作：
创建了BasePage.vue基础页面组件，提供页面结构和CtaSection页脚
为每个功能创建了独立的应用页面：
PathPlanningApp.vue (智程导航)
PersonRecognitionApp.vue (智眸千析)
KnowledgeGraphApp.vue (智慧知库)
DisasterDetectionApp.vue (灾害预警)
VehicleMonitoringApp.vue (车辆监控与报警)
NightEnhancedRecognitionApp.vue (夜间增强识别)
LongRangeIdentificationApp.vue (超远距离识别)
NightGuardianApp.vue (夜间守护者)
更新了路由配置，指向新创建的应用页面
在BasePage中实现了返回按钮功能
删除了不再需要的FunctionAppTemplate.vue文件
每个功能页面都保留了空白的内容区域，为后续实现提供了基础框架。