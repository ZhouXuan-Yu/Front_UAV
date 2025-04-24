/**
 * 文件名: ProfileView.vue
 * 描述: 用户个人资料页面
 * 在项目中的作用: 
 * - 提供用户个人信息的展示和编辑功能
 * - 实现用户隐私设置和安全管理
 * - 支持个人资料的更新与保存
 * - 提供用户友好的界面与交互体验
 */

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';

const router = useRouter();

// 模块显示控制
const activeTab = ref('basic'); // basic, contact, security
const isEditing = ref(false);
const showPasswordModal = ref(false);
const showDeleteConfirm = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// 获取当前用户信息
const currentUser = ref<any>(null);
const originalUserData = ref<any>(null);

// 表单数据
const userForm = reactive({
  username: '',
  nickname: '',
  realName: '',
  gender: '',
  birthdate: '',
  email: '',
  phone: '',
  address: '',
  bio: '',
  avatar: ''
});

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单错误
const formErrors = reactive({
  general: '',
  nickname: '',
  email: '',
  phone: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 初始化页面
onMounted(() => {
  loadUserData();
});

// 加载用户数据
const loadUserData = () => {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) {
    router.push('/auth');
    return;
  }

  try {
    currentUser.value = JSON.parse(userStr);
    
    // 获取完整的用户数据
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userData = users.find((u: any) => u.username === currentUser.value.username);
    
    if (userData) {
      // 保存原始数据用于比较变更
      originalUserData.value = { ...userData };
      
      // 设置表单数据
      userForm.username = userData.username || '';
      userForm.nickname = userData.nickname || '';
      userForm.realName = userData.realName || '';
      userForm.gender = userData.gender || '';
      userForm.birthdate = userData.birthdate || '';
      userForm.email = userData.email || '';
      userForm.phone = userData.phone || '';
      userForm.address = userData.address || '';
      userForm.bio = userData.bio || '';
      userForm.avatar = userData.avatar || '';
    }
  } catch (e) {
    console.error('解析用户数据出错:', e);
    router.push('/auth');
  }
};

// 切换编辑模式
const toggleEditMode = () => {
  if (isEditing.value) {
    // 取消编辑，恢复原始数据
    loadUserData();
  }
  isEditing.value = !isEditing.value;
  errorMessage.value = '';
  successMessage.value = '';
};

// 切换选项卡
const setActiveTab = (tab: string) => {
  activeTab.value = tab;
  errorMessage.value = '';
  successMessage.value = '';
};

// 验证表单
const validateForm = (): boolean => {
  let isValid = true;
  formErrors.general = '';
  formErrors.nickname = '';
  formErrors.email = '';
  formErrors.phone = '';
  
  // 电子邮件验证
  if (userForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
    formErrors.email = '请输入有效的电子邮件地址';
    isValid = false;
  }
  
  // 手机号验证
  if (userForm.phone && !/^1[3-9]\d{9}$/.test(userForm.phone)) {
    formErrors.phone = '请输入有效的手机号码';
    isValid = false;
  }
  
  return isValid;
};

// 验证密码表单
const validatePasswordForm = (): boolean => {
  let isValid = true;
  formErrors.currentPassword = '';
  formErrors.newPassword = '';
  formErrors.confirmPassword = '';
  formErrors.general = '';
  
  if (!passwordForm.currentPassword) {
    formErrors.currentPassword = '请输入当前密码';
    isValid = false;
  }
  
  if (!passwordForm.newPassword) {
    formErrors.newPassword = '请输入新密码';
    isValid = false;
  } else if (passwordForm.newPassword.length < 6) {
    formErrors.newPassword = '密码长度不能少于6个字符';
    isValid = false;
  }
  
  if (!passwordForm.confirmPassword) {
    formErrors.confirmPassword = '请确认新密码';
    isValid = false;
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    formErrors.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  }
  
  return isValid;
};

// 保存用户信息
const saveUserInfo = () => {
  if (!validateForm()) return;
  
  try {
    // 获取所有用户
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.username === currentUser.value.username);
    
    if (userIndex >= 0) {
      // 更新用户数据，保留原有字段
      const updatedUser = {
        ...users[userIndex],
        nickname: userForm.nickname,
        realName: userForm.realName,
        gender: userForm.gender,
        birthdate: userForm.birthdate,
        email: userForm.email,
        phone: userForm.phone,
        address: userForm.address,
        bio: userForm.bio,
        avatar: userForm.avatar,
        updatedAt: new Date().toISOString()
      };
      
      // 更新用户数组
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
      
      // 更新原始数据引用
      originalUserData.value = { ...updatedUser };
      
      // 显示成功消息
      successMessage.value = '个人信息已成功更新';
      errorMessage.value = '';
      isEditing.value = false;
    } else {
      errorMessage.value = '用户不存在，请重新登录';
      successMessage.value = '';
    }
  } catch (e) {
    console.error('保存用户数据出错:', e);
    errorMessage.value = '保存失败，请稍后再试';
    successMessage.value = '';
  }
};

// 加密密码
const encryptPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

// 打开密码修改模态框
const openPasswordModal = () => {
  showPasswordModal.value = true;
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  formErrors.currentPassword = '';
  formErrors.newPassword = '';
  formErrors.confirmPassword = '';
  formErrors.general = '';
};

// 关闭密码修改模态框
const closePasswordModal = () => {
  showPasswordModal.value = false;
};

// 修改密码
const changePassword = () => {
  if (!validatePasswordForm()) return;
  
  try {
    // 获取所有用户
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.username === currentUser.value.username);
    
    if (userIndex >= 0) {
      // 验证当前密码
      const hashedCurrentPassword = encryptPassword(passwordForm.currentPassword);
      if (users[userIndex].password !== hashedCurrentPassword) {
        formErrors.currentPassword = '当前密码不正确';
        return;
      }
      
      // 更新密码
      const hashedNewPassword = encryptPassword(passwordForm.newPassword);
      users[userIndex].password = hashedNewPassword;
      users[userIndex].updatedAt = new Date().toISOString();
      
      // 保存更新
      localStorage.setItem('users', JSON.stringify(users));
      
      // 关闭模态框并显示成功消息
      showPasswordModal.value = false;
      successMessage.value = '密码已成功修改';
      errorMessage.value = '';
    } else {
      formErrors.general = '用户不存在，请重新登录';
    }
  } catch (e) {
    console.error('修改密码出错:', e);
    formErrors.general = '修改失败，请稍后再试';
  }
};

// 打开删除账户确认框
const openDeleteConfirm = () => {
  showDeleteConfirm.value = true;
};

// 关闭删除账户确认框
const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
};

// 删除账户
const deleteAccount = () => {
  try {
    // 获取所有用户
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter((u: any) => u.username !== currentUser.value.username);
    
    // 保存更新后的用户列表
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    
    // 清除当前用户
    localStorage.removeItem('currentUser');
    
    // 跳转到登录页面
    router.push('/auth');
  } catch (e) {
    console.error('删除账户出错:', e);
    errorMessage.value = '删除失败，请稍后再试';
    showDeleteConfirm.value = false;
  }
};

// 上传头像（模拟）
const uploadAvatar = (event: any) => {
  const file = event.target.files[0];
  if (file && file.type.match('image.*')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        userForm.avatar = e.target.result.toString();
      }
    };
    reader.readAsDataURL(file);
  }
};
</script>

<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="breadcrumb">
        <a href="/" @click.prevent="router.push('/')">首页</a> &gt; 
        <span>个人中心</span>
      </div>
      <h1>个人资料</h1>
      <p class="subtitle">管理您的个人信息和账户安全</p>
    </div>
    
    <div class="profile-content">
      <!-- 侧边导航 -->
      <div class="profile-sidebar">
        <div class="avatar-section">
          <div class="avatar" :style="{ backgroundImage: userForm.avatar ? `url(${userForm.avatar})` : 'none' }">
            <span v-if="!userForm.avatar">{{ userForm.username ? userForm.username.charAt(0).toUpperCase() : 'U' }}</span>
          </div>
          <h3>{{ userForm.nickname || userForm.username }}</h3>
          <p v-if="userForm.email">{{ userForm.email }}</p>
        </div>
        
        <div class="sidebar-nav">
          <button 
            @click="setActiveTab('basic')" 
            :class="{ active: activeTab === 'basic' }"
          >
            基本信息
          </button>
          <button 
            @click="setActiveTab('contact')" 
            :class="{ active: activeTab === 'contact' }"
          >
            联系方式
          </button>
          <button 
            @click="setActiveTab('security')" 
            :class="{ active: activeTab === 'security' }"
          >
            安全设置
          </button>
        </div>
      </div>
      
      <!-- 主内容区 -->
      <div class="profile-main">
        <!-- 消息提示 -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <!-- 基本信息模块 -->
        <div v-if="activeTab === 'basic'" class="profile-section">
          <div class="section-header">
            <h2>基本信息</h2>
            <button 
              @click="toggleEditMode" 
              class="edit-button"
            >
              {{ isEditing ? '取消' : '编辑' }}
            </button>
          </div>
          
          <div class="form-container">
            <div class="form-group">
              <label for="username">用户名</label>
              <input 
                id="username" 
                v-model="userForm.username" 
                type="text" 
                disabled
                class="readonly-input"
              />
              <span class="field-hint">用户名不可修改</span>
            </div>
            
            <div class="form-group">
              <label for="nickname">昵称</label>
              <input 
                id="nickname" 
                v-model="userForm.nickname" 
                type="text" 
                :disabled="!isEditing"
                placeholder="设置一个昵称"
              />
              <div v-if="formErrors.nickname" class="error-hint">
                {{ formErrors.nickname }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="realName">真实姓名 <span class="optional">(可选)</span></label>
              <input 
                id="realName" 
                v-model="userForm.realName" 
                type="text" 
                :disabled="!isEditing"
                placeholder="填写您的真实姓名"
              />
            </div>
            
            <div class="form-group">
              <label for="gender">性别 <span class="optional">(可选)</span></label>
              <select 
                id="gender" 
                v-model="userForm.gender" 
                :disabled="!isEditing"
              >
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
                <option value="private">不愿透露</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="birthdate">出生日期 <span class="optional">(可选)</span></label>
              <input 
                id="birthdate" 
                v-model="userForm.birthdate" 
                type="date" 
                :disabled="!isEditing"
              />
            </div>
            
            <div class="form-group">
              <label for="bio">个人简介 <span class="optional">(可选)</span></label>
              <textarea 
                id="bio" 
                v-model="userForm.bio" 
                :disabled="!isEditing"
                placeholder="介绍一下自己..."
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="avatar">头像 <span class="optional">(可选)</span></label>
              <div class="avatar-upload">
                <div class="preview-avatar" :style="{ backgroundImage: userForm.avatar ? `url(${userForm.avatar})` : 'none' }">
                  <span v-if="!userForm.avatar">{{ userForm.username ? userForm.username.charAt(0).toUpperCase() : 'U' }}</span>
                </div>
                <input 
                  v-if="isEditing"
                  id="avatar" 
                  type="file" 
                  accept="image/*" 
                  @change="uploadAvatar"
                  class="file-input"
                />
                <label v-if="isEditing" for="avatar" class="upload-button">选择图片</label>
                <p class="field-hint">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
              </div>
            </div>
            
            <div v-if="isEditing" class="form-actions">
              <button @click="toggleEditMode" class="cancel-button">取消</button>
              <button @click="saveUserInfo" class="save-button">保存</button>
            </div>
          </div>
        </div>
        
        <!-- 联系方式模块 -->
        <div v-if="activeTab === 'contact'" class="profile-section">
          <div class="section-header">
            <h2>联系方式</h2>
            <button 
              @click="toggleEditMode" 
              class="edit-button"
            >
              {{ isEditing ? '取消' : '编辑' }}
            </button>
          </div>
          
          <div class="form-container">
            <div class="form-group">
              <label for="email">电子邮箱</label>
              <input 
                id="email" 
                v-model="userForm.email" 
                type="email" 
                :disabled="!isEditing"
                placeholder="填写您的邮箱地址"
              />
              <div v-if="formErrors.email" class="error-hint">
                {{ formErrors.email }}
              </div>
              <span class="field-hint">用于接收通知和找回密码</span>
            </div>
            
            <div class="form-group">
              <label for="phone">手机号码 <span class="optional">(可选)</span></label>
              <input 
                id="phone" 
                v-model="userForm.phone" 
                type="tel" 
                :disabled="!isEditing"
                placeholder="填写您的手机号码"
              />
              <div v-if="formErrors.phone" class="error-hint">
                {{ formErrors.phone }}
              </div>
              <span class="field-hint">用于接收重要通知和验证码</span>
            </div>
            
            <div class="form-group">
              <label for="address">地址 <span class="optional">(可选)</span></label>
              <textarea 
                id="address" 
                v-model="userForm.address" 
                :disabled="!isEditing"
                placeholder="填写您的详细地址"
                rows="3"
              ></textarea>
            </div>
            
            <div v-if="isEditing" class="form-actions">
              <button @click="toggleEditMode" class="cancel-button">取消</button>
              <button @click="saveUserInfo" class="save-button">保存</button>
            </div>
          </div>
        </div>
        
        <!-- 安全设置模块 -->
        <div v-if="activeTab === 'security'" class="profile-section">
          <div class="section-header">
            <h2>安全设置</h2>
          </div>
          
          <div class="security-container">
            <div class="security-item">
              <div class="security-info">
                <h3>登录密码</h3>
                <p>用于保护账号安全，建议定期更换</p>
              </div>
              <button @click="openPasswordModal" class="action-button">修改密码</button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h3>账号注销</h3>
                <p>永久删除您的账户和所有相关数据</p>
              </div>
              <button @click="openDeleteConfirm" class="delete-button">删除账户</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 密码修改模态框 -->
    <div class="modal-overlay" v-if="showPasswordModal">
      <div class="modal">
        <div class="modal-header">
          <h3>修改密码</h3>
          <button @click="closePasswordModal" class="close-button">&times;</button>
        </div>
        
        <div v-if="formErrors.general" class="error-message modal-error">
          {{ formErrors.general }}
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="currentPassword">当前密码</label>
            <input 
              id="currentPassword" 
              v-model="passwordForm.currentPassword" 
              type="password" 
              placeholder="输入当前密码"
            />
            <div v-if="formErrors.currentPassword" class="error-hint">
              {{ formErrors.currentPassword }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="newPassword">新密码</label>
            <input 
              id="newPassword" 
              v-model="passwordForm.newPassword" 
              type="password" 
              placeholder="输入新密码"
            />
            <div v-if="formErrors.newPassword" class="error-hint">
              {{ formErrors.newPassword }}
            </div>
            <span class="field-hint">密码长度至少6位，建议使用字母、数字和特殊字符组合</span>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">确认新密码</label>
            <input 
              id="confirmPassword" 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              placeholder="再次输入新密码"
            />
            <div v-if="formErrors.confirmPassword" class="error-hint">
              {{ formErrors.confirmPassword }}
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closePasswordModal" class="cancel-button">取消</button>
          <button @click="changePassword" class="save-button">确认修改</button>
        </div>
      </div>
    </div>
    
    <!-- 删除账户确认模态框 -->
    <div class="modal-overlay" v-if="showDeleteConfirm">
      <div class="modal">
        <div class="modal-header">
          <h3>删除账户</h3>
          <button @click="closeDeleteConfirm" class="close-button">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="confirm-message warning">
            <p><strong>警告：</strong> 此操作将永久删除您的账户和所有相关数据，且无法恢复。</p>
            <p>确定要继续吗？</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeDeleteConfirm" class="cancel-button">取消</button>
          <button @click="deleteAccount" class="delete-button">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #333;
}

.profile-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.breadcrumb {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.breadcrumb a {
  color: #3B82F6;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.profile-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.profile-content {
  display: flex;
  gap: 2rem;
}

.profile-sidebar {
  flex: 0 0 250px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #3B82F6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background-size: cover;
  background-position: center;
}

.avatar-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.avatar-section p {
  font-size: 0.9rem;
  color: #666;
  word-break: break-all;
  text-align: center;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-nav button {
  background: none;
  border: none;
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #333;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-nav button:hover {
  background-color: #f3f4f6;
}

.sidebar-nav button.active {
  background-color: #3B82F6;
  color: white;
  font-weight: 500;
}

.profile-main {
  flex: 1;
  min-width: 0;
}

.profile-section {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.edit-button {
  background-color: transparent;
  border: 1px solid #3B82F6;
  color: #3B82F6;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-button:hover {
  background-color: #3B82F6;
  color: white;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #4a5568;
}

.optional {
  font-weight: normal;
  color: #718096;
  font-size: 0.875rem;
}

input, select, textarea {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: all 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

input:disabled, select:disabled, textarea:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.readonly-input {
  background-color: #f9fafb;
  color: #4a5568;
}

.error-hint {
  color: #e53e3e;
  font-size: 0.875rem;
}

.field-hint {
  color: #718096;
  font-size: 0.875rem;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #3B82F6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  background-size: cover;
  background-position: center;
}

.file-input {
  display: none;
}

.upload-button {
  display: inline-block;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #4b5563;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}

.upload-button:hover {
  background-color: #e5e7eb;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.save-button {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.cancel-button {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

.security-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.security-item:last-child {
  border-bottom: none;
}

.security-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.security-info p {
  color: #718096;
  font-size: 0.95rem;
}

.action-button {
  background-color: transparent;
  border: 1px solid #3B82F6;
  color: #3B82F6;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #3B82F6;
  color: white;
}

.delete-button {
  background-color: transparent;
  border: 1px solid #e53e3e;
  color: #e53e3e;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-button:hover {
  background-color: #e53e3e;
  color: white;
}

.success-message {
  background-color: rgba(16, 185, 129, 0.1);
  border-left: 4px solid #10b981;
  color: #065f46;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
}

.error-message {
  background-color: rgba(229, 62, 62, 0.1);
  border-left: 4px solid #e53e3e;
  color: #9b1c1c;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
}

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

.modal {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  animation: modalFadeIn 0.3s forwards;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

.modal-error {
  margin: 0 1.5rem;
  margin-top: 1rem;
}

.confirm-message {
  line-height: 1.6;
}

.warning {
  color: #d97706;
}

.warning strong {
  color: #b45309;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }
  
  .profile-sidebar {
    flex: 0 0 auto;
  }
  
  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .sidebar-nav button {
    flex: 1 0 auto;
    text-align: center;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .security-item button {
    width: 100%;
  }
}
</style> 