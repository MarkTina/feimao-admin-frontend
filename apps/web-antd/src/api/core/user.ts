import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient
    .get<UserInfo & { id: number; is_superuser: boolean }>('/auth/me/')
    .then((user) => ({
    ...user,
    avatar: '',
    desc: 'BigFaceCat 管理员',
    homePath: '/analytics',
    realName: user.username,
    roles: user.is_superuser ? ['superuser'] : ['staff'],
    token: '',
    userId: String(user.id),
    }));
}
