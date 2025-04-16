<template>
  <div class="element-demo-container">
    <h2>Element Plus 组件演示</h2>
    
    <div class="demo-section">
      <h3>按钮组件</h3>
      <div class="button-demo">
        <el-button>默认按钮</el-button>
        <el-button type="primary">主要按钮</el-button>
        <el-button type="success">成功按钮</el-button>
        <el-button type="info">信息按钮</el-button>
        <el-button type="warning">警告按钮</el-button>
        <el-button type="danger">危险按钮</el-button>
      </div>
    </div>
    
    <div class="demo-section">
      <h3>表单组件</h3>
      <el-form :model="form" label-width="120px">
        <el-form-item label="活动名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="活动区域">
          <el-select v-model="form.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="即时配送">
          <el-switch v-model="form.delivery" />
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="demo-section">
      <h3>消息提示</h3>
      <el-button @click="openMessage">显示消息</el-button>
    </div>

    <div class="demo-section">
      <h3>对话框</h3>
      <el-button type="primary" @click="dialogVisible = true">
        打开对话框
      </el-button>
      <el-dialog
        v-model="dialogVisible"
        title="提示"
        width="30%"
      >
        <span>这是一个使用Element Plus创建的对话框</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="dialogVisible = false">
              确认
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)

const form = reactive({
  name: '',
  region: '',
  date: '',
  delivery: false,
})

const onSubmit = () => {
  console.log('表单提交')
  ElMessage({
    message: '表单提交成功',
    type: 'success',
  })
}

const openMessage = () => {
  ElMessage('这是一条消息提示')
}
</script>

<style scoped>
.element-demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
}

h3 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #EBEEF5;
}

.button-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 