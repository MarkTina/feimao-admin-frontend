import { useAccessStore } from '@vben/stores';
import { createAlova } from 'alova';
import { createClientTokenAuthentication } from 'alova/client';
import adapterFetch from 'alova/fetch';
import VueHook from 'alova/vue';

export interface PageResult<T = Record<string, unknown>> {
  count: number;
  next: null | string;
  previous: null | string;
  results: T[];
}

const apiBase = `${import.meta.env.VITE_GLOB_API_URL || '/api/admin/v1'}`.replace(/\/$/, '');

function isJwtExpired(token: null | string) {
  if (!token) return true;
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload.replaceAll('-', '+').replaceAll('_', '/')));
    return typeof decoded.exp !== 'number' || decoded.exp * 1000 <= Date.now() + 5000;
  } catch {
    return true;
  }
}

const tokenAuth = createClientTokenAuthentication({
  refreshToken: {
    isExpired: () => isJwtExpired(useAccessStore().accessToken),
    async handler() {
      const accessStore = useAccessStore();
      if (!accessStore.refreshToken) throw new Error('登录状态已过期');
      const response = await fetch(`${apiBase}/auth/refresh/`, {
        body: JSON.stringify({ refresh: accessStore.refreshToken }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || '登录状态已过期');
      const data = result?.data ?? result;
      const accessToken = data?.accessToken ?? data?.access;
      if (!accessToken) throw new Error('刷新登录状态失败');
      accessStore.setAccessToken(accessToken);
    },
  },
});

export const adminAlova = createAlova({
  baseURL: apiBase,
  requestAdapter: adapterFetch(),
  statesHook: VueHook,
  beforeRequest: tokenAuth.onAuthRequired((method) => {
    const token = useAccessStore().accessToken;
    method.config.headers.Authorization = token ? `Bearer ${token}` : '';
    method.config.headers['Content-Type'] = 'application/json';
  }),
  responded: {
    async onSuccess(response) {
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) {
        const message = data?.message || data?.detail || '请求失败';
        throw new Error(message);
      }
      return data;
    },
    onError(error) {
      throw error;
    },
  },
});

export function listEntities<T>(resource: string, params: Record<string, unknown>) {
  return adminAlova.Get<PageResult<T>>(`/${resource}/`, { params }).send();
}

export function createEntity<T>(resource: string, data: Record<string, unknown>) {
  return adminAlova.Post<T>(`/${resource}/`, data).send();
}

export function updateEntity<T>(resource: string, id: number | string, data: Record<string, unknown>) {
  return adminAlova.Patch<T>(`/${resource}/${id}/`, data).send();
}

export function deleteEntity(resource: string, id: number | string) {
  return adminAlova.Delete(`/${resource}/${id}/`).send();
}

export function getDashboardSummary() {
  return adminAlova.Get<{
    users: number;
    members: number;
    resources: number;
    pending_feedback: number;
    pending_orders: number;
    active_products: number;
  }>('/dashboard/summary/').send();
}
