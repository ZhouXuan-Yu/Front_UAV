/**
 * 文件名: AuthView.vue
 * 描述: 用户登录和注册页面
 * 在项目中的作用: 
 * - 提供用户登录和注册功能
 * - 使用localStorage存储用户数据
 * - 实现密码加密以提高安全性
 * - 提供简洁美观的用户界面
 */

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';

const router = useRouter();
const isLogin = ref(true); // true: 登录模式, false: 注册模式
const showSuccessModal = ref(false);
const showLoginPrompt = ref(false);
const successMessage = ref('');
const promptMessage = ref('');
const redirectTimer = ref<number | null>(null);
const redirectPath = ref('/');

// 表单数据和验证
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
});

const formErrors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  general: ''
});

// 计算属性 - 按钮文本
const buttonText = computed(() => isLogin.value ? '登录' : '注册');
const toggleText = computed(() => isLogin.value ? '还没有账号？去注册' : '已有账号？去登录');

// 组件挂载时检查是否需要显示登录提示
onMounted(() => {
  // 检查是否有登录后重定向路径
  const storedRedirectPath = localStorage.getItem('redirectAfterLogin');
  if (storedRedirectPath) {
    redirectPath.value = storedRedirectPath;
  }
  
  // 检查是否需要显示登录提示
  const shouldShowPrompt = localStorage.getItem('showLoginPrompt');
  if (shouldShowPrompt === 'true') {
    showLoginPrompt.value = true;
    promptMessage.value = '尊敬的用户，您访问的功能需要登录后才能使用。请注册或登录以继续访问。';
    // 清除标记，避免重复显示
    localStorage.removeItem('showLoginPrompt');
  }
});

// 切换登录/注册模式
const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
  resetForm();
};

// 关闭登录提示弹窗
const closeLoginPrompt = () => {
  showLoginPrompt.value = false;
};

// 重置表单
const resetForm = () => {
  formData.username = '';
  formData.password = '';
  formData.confirmPassword = '';
  resetErrors();
};

// 重置错误提示
const resetErrors = () => {
  formErrors.username = '';
  formErrors.password = '';
  formErrors.confirmPassword = '';
  formErrors.general = '';
};

// 验证表单
const validateForm = (): boolean => {
  resetErrors();
  let isValid = true;

  // 用户名验证
  if (!formData.username) {
    formErrors.username = '请输入用户名';
    isValid = false;
  } else if (formData.username.length < 3) {
    formErrors.username = '用户名长度不能少于3个字符';
    isValid = false;
  }

  // 密码验证
  if (!formData.password) {
    formErrors.password = '请输入密码';
    isValid = false;
  } else if (formData.password.length < 6) {
    formErrors.password = '密码长度不能少于6个字符';
    isValid = false;
  }

  // 注册模式下的确认密码验证
  if (!isLogin.value) {
    if (!formData.confirmPassword) {
      formErrors.confirmPassword = '请再次输入密码';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }
  }

  return isValid;
};

// 加密密码
const encryptPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

// 触发用户状态更新事件
const notifyUserStateChange = () => {
  // 创建自定义事件通知应用中的其他组件更新用户状态
  window.dispatchEvent(new Event('user-state-changed'));
};

// 处理提交
const handleSubmit = () => {
  if (!validateForm()) return;

  if (isLogin.value) {
    handleLogin();
  } else {
    handleRegister();
  }
};

// 处理登录
const handleLogin = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((u: any) => u.username === formData.username);

  if (!user) {
    formErrors.general = '用户不存在';
    return;
  }

  const hashedPassword = encryptPassword(formData.password);
  if (user.password !== hashedPassword) {
    formErrors.general = '密码错误';
    return;
  }

  // 登录成功，保存当前用户
  const currentUser = {
    username: user.username,
    isLoggedIn: true
  };
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // 触发用户状态更新事件
  notifyUserStateChange();
  
  // 设置重定向提示文本
  const targetPath = redirectPath.value !== '/' ? '之前访问的页面' : '首页';
  successMessage.value = `登录成功，即将跳转到${targetPath}...`;
  showSuccessModal.value = true;
  
  // 3秒后自动跳转到之前的页面或首页
  redirectTimer.value = setTimeout(() => {
    redirectToTarget();
  }, 3000) as unknown as number;
};

// 重定向到目标页面并清除缓存
const redirectToTarget = () => {
  const target = redirectPath.value;
  // 清除重定向路径
  localStorage.removeItem('redirectAfterLogin');
  redirectPath.value = '/';
  // 跳转到目标页面
  router.push(target);
};

// 处理注册
const handleRegister = () => {
  // 获取已有用户
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // 检查用户名是否已存在
  if (users.some((u: any) => u.username === formData.username)) {
    formErrors.username = '该用户名已被使用';
    return;
  }

  // 创建新用户并加密密码
  const newUser = {
    username: formData.username,
    password: encryptPassword(formData.password),
    createdAt: new Date().toISOString()
  };

  // 保存用户信息
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // 自动登录
  const currentUser = {
    username: newUser.username,
    isLoggedIn: true
  };
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // 触发用户状态更新事件
  notifyUserStateChange();
  
  // 设置重定向提示文本
  const targetPath = redirectPath.value !== '/' ? '之前访问的页面' : '首页';
  successMessage.value = `注册成功，即将跳转到${targetPath}...`;
  showSuccessModal.value = true;
  
  // 3秒后自动跳转到之前的页面或首页
  redirectTimer.value = setTimeout(() => {
    redirectToTarget();
  }, 3000) as unknown as number;
};

// 组件卸载前清除定时器
onUnmounted(() => {
  if (redirectTimer.value) {
    clearTimeout(redirectTimer.value);
  }
});

// 关闭弹窗并立即跳转
const closeModalAndRedirect = () => {
  showSuccessModal.value = false;
  if (redirectTimer.value) {
    clearTimeout(redirectTimer.value);
    redirectTimer.value = null;
  }
  redirectToTarget();
};
</script>

<template>
  <div class="auth-container">
    <!-- 登录提示弹窗 -->
    <div class="modal-overlay" v-if="showLoginPrompt">
      <div class="login-prompt-modal">
        <div class="modal-icon warning">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="modal-title">{{ promptMessage }}</h3>
        <button class="modal-button" @click="closeLoginPrompt">
          我知道了
        </button>
      </div>
    </div>
    
    <div class="auth-form">
      <h1 class="title">{{ isLogin ? '登录账户' : '创建新账户' }}</h1>
      
      <div v-if="formErrors.general" class="error-message general-error">
        {{ formErrors.general }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
          <div v-if="formErrors.username" class="error-message">
            {{ formErrors.username }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
          <div v-if="formErrors.password" class="error-message">
            {{ formErrors.password }}
          </div>
        </div>
        
        <div v-if="!isLogin" class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            autocomplete="new-password"
          />
          <div v-if="formErrors.confirmPassword" class="error-message">
            {{ formErrors.confirmPassword }}
          </div>
        </div>
        
        <button type="submit" class="submit-button">
          {{ buttonText }}
        </button>
      </form>
      
      <div class="toggle-auth">
        <button @click="toggleAuthMode" class="toggle-button">
          {{ toggleText }}
        </button>
      </div>
    </div>

    <!-- 成功弹窗 -->
    <div class="modal-overlay" v-if="showSuccessModal">
      <div class="success-modal">
        <div class="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3 class="modal-title">{{ successMessage }}</h3>
        <button class="modal-button" @click="closeModalAndRedirect">
          立即前往
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.auth-form {
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  margin-top: 3rem;
  transition: all 0.3s ease;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #3B82F6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.general-error {
  background-color: rgba(229, 62, 62, 0.1);
  border-left: 4px solid #e53e3e;
  padding: 0.75rem;
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
}

.submit-button {
  width: 100%;
  padding: 0.875rem;
  background-color: #3B82F6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.submit-button:active {
  transform: translateY(0);
}

.toggle-auth {
  margin-top: 1.5rem;
  text-align: center;
}

.toggle-button {
  background: none;
  border: none;
  color: #3B82F6;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-button:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.success-modal, .login-prompt-modal {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: modalFadeIn 0.3s forwards;
}

.login-prompt-modal .modal-icon.warning {
  color: #f59e0b;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-icon {
  color: #10b981;
  margin: 0 auto 1rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
}

.modal-button {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}
</style> 