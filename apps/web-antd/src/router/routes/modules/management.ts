import type { RouteRecordRaw } from 'vue-router';

const page = () => import('#/views/management/entity-list.vue');

const routes: RouteRecordRaw[] = [
  {
    name: 'UsersManagement', path: '/users', meta: { icon: 'lucide:users', order: 10, title: '用户管理' },
    children: [
      { name: 'Users', path: '/users/list', component: page, meta: { entity: 'users', icon: 'lucide:user-round', title: '用户列表' } },
      { name: 'Feedback', path: '/users/feedback', component: page, meta: { entity: 'feedback', icon: 'lucide:message-square-text', title: '用户反馈' } },
      { name: 'SearchHistories', path: '/users/search-histories', component: page, meta: { entity: 'searchHistories', icon: 'lucide:history', title: '搜索历史' } },
      { name: 'HotKeywords', path: '/users/hot-keywords', component: page, meta: { entity: 'hotKeywords', icon: 'lucide:flame', title: '热词管理' } },
    ],
  },
  {
    name: 'MembershipManagement', path: '/membership', meta: { icon: 'lucide:badge-dollar-sign', order: 20, title: '会员与兑换' },
    children: [
      { name: 'VipProducts', path: '/membership/products', component: page, meta: { entity: 'vipProducts', icon: 'lucide:package', title: '会员商品' } },
      { name: 'VipOrders', path: '/membership/orders', component: page, meta: { entity: 'vipOrders', icon: 'lucide:receipt-text', title: '会员订单' } },
      { name: 'RedemptionCodes', path: '/membership/codes', component: page, meta: { entity: 'redemptionCodes', icon: 'lucide:ticket-check', title: '兑换码' } },
      { name: 'RedemptionLogs', path: '/membership/logs', component: page, meta: { entity: 'redemptionLogs', icon: 'lucide:clipboard-list', title: '兑换记录' } },
    ],
  },
  {
    name: 'PointsManagement', path: '/points', meta: { icon: 'lucide:circle-dollar-sign', order: 30, title: '积分中心' },
    children: [
      { name: 'PointsConfig', path: '/points/config', component: page, meta: { entity: 'pointsConfig', icon: 'lucide:settings-2', title: '积分配置' } },
      { name: 'ConsecutiveRewards', path: '/points/rewards', component: page, meta: { entity: 'consecutiveRewards', icon: 'lucide:calendar-check-2', title: '签到奖励' } },
      { name: 'Prizes', path: '/points/prizes', component: page, meta: { entity: 'prizes', icon: 'lucide:gift', title: '积分奖品' } },
      { name: 'UserPoints', path: '/points/accounts', component: page, meta: { entity: 'userPoints', icon: 'lucide:wallet-cards', title: '用户积分' } },
      { name: 'CheckInRecords', path: '/points/check-ins', component: page, meta: { entity: 'checkInRecords', icon: 'lucide:calendar-days', title: '签到记录' } },
      { name: 'PointsTransactions', path: '/points/transactions', component: page, meta: { entity: 'pointsTransactions', icon: 'lucide:arrow-left-right', title: '积分流水' } },
      { name: 'AdWatchRecords', path: '/points/ad-watch', component: page, meta: { entity: 'adWatchRecords', icon: 'lucide:play-square', title: '广告记录' } },
      { name: 'PointsExchangeRecords', path: '/points/exchanges', component: page, meta: { entity: 'pointsExchangeRecords', icon: 'lucide:repeat-2', title: '兑换记录' } },
    ],
  },
  {
    name: 'ResourceManagement', path: '/resources', meta: { icon: 'lucide:database', order: 40, title: '资源管理' },
    children: [
      { name: 'Resources', path: '/resources/list', component: page, meta: { entity: 'resources', icon: 'lucide:folder-search', title: '资源列表' } },
      { name: 'CloudDrives', path: '/resources/cloud-drives', component: page, meta: { entity: 'cloudDrives', icon: 'lucide:cloud', title: '云盘类型' } },
      { name: 'SearchEngines', path: '/resources/search-engines', component: page, meta: { entity: 'searchEngines', icon: 'lucide:search-code', title: '搜索引擎' } },
      { name: 'BoutiqueResources', path: '/resources/boutique', component: page, meta: { entity: 'boutiqueResources', icon: 'lucide:gem', title: '精品资源' } },
    ],
  },
  {
    name: 'SystemManagement', path: '/system', meta: { icon: 'lucide:panel-top', order: 50, title: '展示与配置' },
    children: [
      { name: 'CloudConfigs', path: '/system/cloud-configs', component: page, meta: { entity: 'cloudConfigs', icon: 'lucide:cloud-cog', title: '云端配置' } },
      { name: 'TopNotices', path: '/system/notices', component: page, meta: { entity: 'topNotices', icon: 'lucide:megaphone', title: '顶部通知' } },
      { name: 'CloudMenus', path: '/system/menus', component: page, meta: { entity: 'cloudMenus', icon: 'lucide:menu-square', title: '云盘菜单' } },
      { name: 'AdConfigs', path: '/system/ads', component: page, meta: { entity: 'adConfigs', icon: 'lucide:rectangle-horizontal', title: '搜索结果广告' } },
    ],
  },
];

export default routes;
