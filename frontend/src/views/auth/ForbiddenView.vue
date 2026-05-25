<template>
  <main class="forbidden-page">
    <el-result icon="warning" title="403" sub-title="当前账号没有后台管理权限">
      <template #extra>
        <RouterLink to="/"><el-button type="primary">返回前台</el-button></RouterLink>
        <RouterLink to="/login"><el-button>去登录</el-button></RouterLink>
      </template>
    </el-result>
  </main>
</template>
