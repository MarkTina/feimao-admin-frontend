import { requestClient } from '#/api/request';
import { useAccessStore } from '@vben/stores';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      username: string;
      is_staff: boolean;
      is_superuser: boolean;
    };
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login/', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  const accessStore = useAccessStore();
  return requestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh/', {
    refresh: accessStore.refreshToken,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.post('/auth/logout/', {});
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return Promise.resolve<string[]>([]);
}
