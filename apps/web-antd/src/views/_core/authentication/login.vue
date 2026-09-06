<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const formSchema = computed((): VbenFormSchema[] => [
  {
    component: 'VbenInput',
    componentProps: { autocomplete: 'username', placeholder: '请输入管理员用户名' },
    fieldName: 'username',
    label: '管理员账号',
    rules: z.string().min(1, { message: '请输入管理员用户名' }),
  },
  {
    component: 'VbenInputPassword',
    componentProps: { autocomplete: 'current-password', placeholder: '请输入密码' },
    fieldName: 'password',
    label: '密码',
    rules: z.string().min(1, { message: '请输入密码' }),
  },
]);
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    sub-title="仅限已授权的 staff / superuser 账号"
    title="BigFaceCat 管理后台"
    @submit="authStore.authLogin"
  />
</template>
