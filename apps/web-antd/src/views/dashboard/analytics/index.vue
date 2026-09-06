<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import {
  CloudServerOutlined,
  DatabaseOutlined,
  MessageOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue';
import { Button, message, Progress, Tag } from 'ant-design-vue';

import { getDashboardSummary } from '#/api/admin';

const loading = ref(false);
const stats = ref({ users: 0, members: 0, resources: 0, pending_feedback: 0, pending_orders: 0, active_products: 0 });

const membershipRate = computed(() => stats.value.users ? Math.round((stats.value.members / stats.value.users) * 100) : 0);
const items = computed(() => [
  { key: 'users', label: '用户总数', value: stats.value.users, hint: `${stats.value.members} 位有效会员`, icon: TeamOutlined, tone: 'teal' },
  { key: 'resources', label: '资源索引', value: stats.value.resources, hint: '可检索资源记录', icon: DatabaseOutlined, tone: 'blue' },
  { key: 'feedback', label: '待处理反馈', value: stats.value.pending_feedback, hint: '需要管理员跟进', icon: MessageOutlined, tone: 'red' },
  { key: 'orders', label: '待支付订单', value: stats.value.pending_orders, hint: `${stats.value.active_products} 个在售商品`, icon: ShoppingOutlined, tone: 'amber' },
]);

async function loadSummary() {
  loading.value = true;
  try {
    stats.value = await getDashboardSummary();
  } catch (error) {
    message.error(error instanceof Error ? error.message : '工作台数据加载失败');
  } finally {
    loading.value = false;
  }
}

onMounted(loadSummary);
</script>

<template>
  <div class="dashboard-page">
    <section class="dashboard-hero">
      <div>
        <p class="eyebrow">BIGFACECAT CONTROL DESK</p>
        <h1>云盘资源运营台</h1>
        <p>资源、会员、积分和客户端配置的统一管理入口。</p>
      </div>
      <div class="service-state">
        <Tag color="green">服务正常</Tag>
        <Button :loading="loading" shape="circle" title="刷新工作台" @click="loadSummary"><ReloadOutlined /></Button>
      </div>
    </section>

    <section class="metrics" aria-label="核心指标">
      <article v-for="item in items" :key="item.key" class="metric" :class="`metric-${item.tone}`">
        <div class="metric-icon"><component :is="item.icon" /></div>
        <div>
          <span>{{ item.label }}</span>
          <strong>{{ item.value.toLocaleString() }}</strong>
          <small>{{ item.hint }}</small>
        </div>
      </article>
    </section>

    <section class="operations-band">
      <div class="section-heading">
        <div>
          <p class="eyebrow">TODAY / OPERATIONS</p>
          <h2>当前运营状态</h2>
        </div>
        <CloudServerOutlined class="section-icon" />
      </div>
      <div class="operation-grid">
        <div class="member-progress">
          <div class="progress-copy">
            <span>会员转化率</span>
            <strong>{{ membershipRate }}%</strong>
          </div>
          <Progress :percent="membershipRate" :show-info="false" stroke-color="#0f766e" />
          <p>{{ stats.members }} 位会员 / {{ stats.users }} 位用户</p>
        </div>
        <dl class="signal-list">
          <div><dt>反馈队列</dt><dd :class="{ alert: stats.pending_feedback > 0 }">{{ stats.pending_feedback }} 待处理</dd></div>
          <div><dt>订单队列</dt><dd>{{ stats.pending_orders }} 待支付</dd></div>
          <div><dt>在售商品</dt><dd>{{ stats.active_products }} 个</dd></div>
          <div><dt>管理接口</dt><dd class="healthy">JWT / Staff 已启用</dd></div>
        </dl>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-page { min-height: 100%; background: #f1f4f5; color: #15202a; }
.dashboard-hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding: 38px 40px 32px; background: #fff; border-bottom: 1px solid #dfe5e8; }
.eyebrow { margin: 0 0 9px; color: #0f766e; font-size: 11px; font-weight: 750; letter-spacing: 1.8px; }
h1, h2 { margin: 0; font-family: "Noto Serif SC", Georgia, serif; letter-spacing: 0; }
h1 { font-size: 32px; }
h2 { font-size: 21px; }
.dashboard-hero p:last-child { margin: 9px 0 0; color: #67727c; font-size: 14px; }
.service-state { display: flex; align-items: center; gap: 10px; }
.metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-bottom: 1px solid #dfe5e8; background: #fff; }
.metric { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 15px; min-height: 150px; padding: 28px 26px; border-right: 1px solid #e2e7ea; }
.metric:last-child { border-right: 0; }
.metric-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 7px; font-size: 20px; }
.metric-teal .metric-icon { color: #0f766e; background: #e6f4f1; }
.metric-blue .metric-icon { color: #2563a8; background: #e8f0f8; }
.metric-red .metric-icon { color: #b53b42; background: #f9e9ea; }
.metric-amber .metric-icon { color: #9a6414; background: #f8efdb; }
.metric span, .metric small { display: block; color: #75808a; font-size: 12px; }
.metric strong { display: block; margin: 5px 0; font-size: 30px; font-variant-numeric: tabular-nums; }
.operations-band { padding: 34px 40px 44px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.section-icon { color: #8b969f; font-size: 22px; }
.operation-grid { display: grid; grid-template-columns: minmax(300px, .8fr) minmax(380px, 1.2fr); gap: 42px; padding: 28px 0; border-top: 1px solid #cfd7dc; border-bottom: 1px solid #cfd7dc; }
.progress-copy { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 15px; }
.progress-copy span { color: #5e6972; font-size: 13px; }
.progress-copy strong { font-size: 27px; }
.member-progress p { margin: 10px 0 0; color: #89939b; font-size: 12px; }
.signal-list { margin: 0; }
.signal-list div { display: flex; align-items: center; justify-content: space-between; min-height: 38px; border-bottom: 1px solid #e0e5e8; }
.signal-list div:last-child { border-bottom: 0; }
.signal-list dt { color: #68737c; font-size: 13px; }
.signal-list dd { margin: 0; font-size: 13px; font-weight: 650; }
.signal-list .alert { color: #b4232d; }
.signal-list .healthy { color: #0f766e; }
@media (max-width: 1000px) { .metrics { grid-template-columns: 1fr 1fr; } .metric:nth-child(2) { border-right: 0; } .operation-grid { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .dashboard-hero { align-items: flex-start; flex-direction: column; padding: 28px 18px; } .metrics { grid-template-columns: 1fr; } .metric { border-right: 0; border-bottom: 1px solid #e2e7ea; } .operations-band { padding: 28px 18px; } h1 { font-size: 27px; } }
</style>
