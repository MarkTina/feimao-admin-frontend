<script setup lang="ts">
import type { Dayjs } from 'dayjs';

import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { createEntity, deleteEntity, listEntities, updateEntity } from '#/api/admin';

import type { EntityConfig } from './entity-config';
import { entityConfigs } from './entity-config';

type EntityRow = Record<string, any>;

const route = useRoute();
const entityKey = computed(() => String(route.meta.entity || 'resources'));
const config = computed<EntityConfig>(() => entityConfigs[entityKey.value] ?? entityConfigs.resources!);
const loading = ref(false);
const rows = ref<EntityRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const filters = reactive<{ dateRange: [Dayjs, Dayjs] | undefined; keyword: string; status: string | undefined }>({
  dateRange: undefined,
  keyword: '',
  status: undefined,
});

const modalOpen = ref(false);
const detailOpen = ref(false);
const editingId = ref<number | string>();
const formModel = reactive<Record<string, any>>({});
const currentRow = ref<EntityRow>();

const tableColumns = computed(() => [
  ...config.value.columns.map((item) => ({ dataIndex: item.key, key: item.key, title: item.label, width: item.width })),
  { fixed: 'right' as const, key: 'actions', title: '操作', width: config.value.readOnly ? 82 : 150 },
]);

function resetForm() {
  Object.keys(formModel).forEach((key) => delete formModel[key]);
  for (const item of config.value.fields || []) {
    formModel[item.key] = item.kind === 'boolean' ? false : undefined;
  }
}

async function loadData() {
  loading.value = true;
  try {
    const result = await listEntities<EntityRow>(config.value.resource, {
      page: page.value,
      page_size: pageSize.value,
      keyword: filters.keyword || undefined,
      date_from: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
      date_to: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
      [config.value.statusField || 'status']: filters.status,
    });
    rows.value = result.results || [];
    total.value = result.count || 0;
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载列表失败');
  } finally {
    loading.value = false;
  }
}

function query() {
  page.value = 1;
  loadData();
}

function resetFilters() {
  filters.keyword = '';
  filters.status = undefined;
  filters.dateRange = undefined;
  query();
}

function openCreate() {
  editingId.value = undefined;
  resetForm();
  modalOpen.value = true;
}

function openEdit(row: EntityRow) {
  editingId.value = row.id;
  resetForm();
  for (const item of config.value.fields || []) {
    const value = row[item.key];
    formModel[item.key] = item.kind === 'datetime' && value ? dayjs(value) : value;
  }
  modalOpen.value = true;
}

function openDetail(row: EntityRow) {
  currentRow.value = row;
  detailOpen.value = true;
}

function buildPayload() {
  const payload: Record<string, unknown> = {};
  for (const item of config.value.fields || []) {
    const value = formModel[item.key];
    if (value === undefined || value === '') continue;
    payload[item.key] = item.kind === 'datetime' && value?.toISOString ? value.toISOString() : value;
  }
  return payload;
}

async function save() {
  const missing = (config.value.fields || []).find((item) => item.required && (formModel[item.key] === undefined || formModel[item.key] === ''));
  if (missing) {
    message.warning(`请填写${missing.label}`);
    return;
  }
  loading.value = true;
  try {
    const payload = buildPayload();
    if (editingId.value === undefined) await createEntity(config.value.resource, payload);
    else await updateEntity(config.value.resource, editingId.value, payload);
    message.success(editingId.value === undefined ? '新增成功' : '保存成功');
    modalOpen.value = false;
    await loadData();
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存失败');
  } finally {
    loading.value = false;
  }
}

function remove(row: EntityRow) {
  Modal.confirm({
    title: `确认删除 #${row.id}？`,
    content: '删除后无法恢复；若对象存在关联数据，后端会拒绝本次操作。',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteEntity(config.value.resource, row.id);
        message.success('删除成功');
        await loadData();
      } catch (error) {
        message.error(error instanceof Error ? error.message : '删除失败');
      }
    },
  });
}

function renderValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '--';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

watch(entityKey, () => {
  page.value = 1;
  resetFilters();
});

onMounted(loadData);
</script>

<template>
  <div class="entity-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">BIGFACECAT / ADMIN</p>
        <h1>{{ config.title }}</h1>
        <p class="description">{{ config.description }}</p>
      </div>
      <div class="record-count"><strong>{{ total }}</strong><span>条记录</span></div>
    </header>

    <section class="filter-band" aria-label="筛选条件">
      <div class="filter-grid">
        <label>
          <span>关键词</span>
          <Input v-model:value="filters.keyword" allow-clear placeholder="输入名称、编号或内容" @press-enter="query">
            <template #prefix><SearchOutlined /></template>
          </Input>
        </label>
        <label>
          <span>状态</span>
          <Select v-model:value="filters.status" allow-clear placeholder="全部状态" :options="[{ label: '启用 / 正常', value: 'true' }, { label: '停用 / 屏蔽', value: 'false' }]" />
        </label>
        <label>
          <span>时间范围</span>
          <DatePicker.RangePicker v-model:value="filters.dateRange" />
        </label>
        <div class="filter-actions">
          <Button type="primary" @click="query"><SearchOutlined />查询</Button>
          <Button @click="resetFilters">重置</Button>
        </div>
      </div>
    </section>

    <section class="table-band">
      <div class="table-toolbar">
        <div>
          <h2>数据列表</h2>
          <span>{{ config.readOnly ? '只读审计数据' : '操作权限由后端再次校验' }}</span>
        </div>
        <Space>
          <Tooltip title="刷新列表"><Button shape="circle" @click="loadData"><ReloadOutlined /></Button></Tooltip>
          <Button v-if="config.allowCreate && !config.readOnly" type="primary" @click="openCreate"><PlusOutlined />新增</Button>
        </Space>
      </div>

      <Table
        :columns="tableColumns"
        :data-source="rows"
        :loading="loading"
        :pagination="{ current: page, pageSize, total, showSizeChanger: true, showTotal: (n: number) => `共 ${n} 条` }"
        :scroll="{ x: 1100 }"
        row-key="id"
        @change="(pager: any) => { page = pager.current; pageSize = pager.pageSize; loadData(); }"
      >
        <template #emptyText><Empty description="暂无匹配数据" /></template>
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.key === 'actions'">
            <Space :size="4">
              <Tooltip title="查看详情"><Button type="text" shape="circle" @click="openDetail(record)"><EyeOutlined /></Button></Tooltip>
              <Tooltip v-if="!config.readOnly && config.fields?.length" title="编辑"><Button type="text" shape="circle" @click="openEdit(record)"><EditOutlined /></Button></Tooltip>
              <Tooltip v-if="config.allowDelete && !config.readOnly" title="删除"><Button danger type="text" shape="circle" @click="remove(record)"><DeleteOutlined /></Button></Tooltip>
            </Space>
          </template>
          <template v-else-if="typeof text === 'boolean'">
            <Tag :color="text ? 'green' : 'default'">{{ text ? '启用' : '停用' }}</Tag>
          </template>
          <template v-else>
            <span class="cell-text" :title="renderValue(text)">{{ renderValue(text) }}</span>
          </template>
        </template>
      </Table>
    </section>

    <Modal v-model:open="modalOpen" :title="editingId === undefined ? `新增${config.title}` : `编辑${config.title}`" :confirm-loading="loading" width="680px" @ok="save">
      <Form layout="vertical" class="entity-form">
        <Form.Item v-for="item in config.fields" :key="item.key" :label="item.label" :required="item.required">
          <Switch v-if="item.kind === 'boolean'" v-model:checked="formModel[item.key]" />
          <InputNumber v-else-if="item.kind === 'number'" v-model:value="formModel[item.key]" class="w-full" />
          <Select v-else-if="item.kind === 'select'" v-model:value="formModel[item.key]" :options="item.options" />
          <DatePicker v-else-if="item.kind === 'datetime'" v-model:value="formModel[item.key]" show-time class="w-full" />
          <Input.TextArea v-else-if="item.kind === 'textarea'" v-model:value="formModel[item.key]" :rows="4" />
          <Input v-else v-model:value="formModel[item.key]" />
        </Form.Item>
      </Form>
    </Modal>

    <Modal v-model:open="detailOpen" :footer="null" :title="`${config.title}详情`" width="760px">
      <Descriptions v-if="currentRow" bordered :column="1" size="small">
        <Descriptions.Item v-for="(value, key) in currentRow" :key="key" :label="String(key)">
          <pre>{{ renderValue(value) }}</pre>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  </div>
</template>

<style scoped>
.entity-page { min-height: 100%; background: #f4f6f8; color: #17212b; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding: 28px 32px 22px; background: #fff; border-bottom: 1px solid #e2e8ee; }
.eyebrow { margin: 0 0 7px; color: #0f766e; font-size: 11px; font-weight: 700; letter-spacing: 1.8px; }
h1 { margin: 0; font-family: "Noto Serif SC", Georgia, serif; font-size: 27px; font-weight: 700; letter-spacing: 0; }
.description { margin: 7px 0 0; color: #68737d; font-size: 13px; }
.record-count { display: flex; align-items: baseline; gap: 7px; color: #76818a; white-space: nowrap; }
.record-count strong { color: #17212b; font-size: 26px; font-variant-numeric: tabular-nums; }
.record-count span { font-size: 12px; }
.filter-band { padding: 20px 32px; background: #f8fafb; border-bottom: 1px solid #dfe5ea; }
.filter-grid { display: grid; grid-template-columns: minmax(220px, 1.4fr) minmax(160px, .7fr) minmax(250px, 1fr) auto; align-items: end; gap: 16px; }
.filter-grid label { display: grid; gap: 7px; color: #4e5963; font-size: 12px; font-weight: 600; }
.filter-actions { display: flex; gap: 8px; }
.table-band { padding: 0 32px 32px; background: #fff; }
.table-toolbar { display: flex; align-items: center; justify-content: space-between; min-height: 76px; gap: 20px; }
.table-toolbar h2 { margin: 0 0 3px; font-size: 16px; font-weight: 650; }
.table-toolbar span { color: #8a949d; font-size: 12px; }
.cell-text { display: block; max-width: 360px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.entity-form { max-height: 62vh; overflow-y: auto; padding-right: 8px; }
.w-full { width: 100%; }
pre { margin: 0; max-height: 180px; overflow: auto; white-space: pre-wrap; word-break: break-all; font-family: "JetBrains Mono", Consolas, monospace; font-size: 12px; }
:deep(.ant-table) { border-top: 1px solid #e5e9ed; }
:deep(.ant-table-thead > tr > th) { background: #f6f8f9; color: #4a555f; font-size: 12px; font-weight: 700; }
:deep(.ant-table-tbody > tr > td) { font-size: 13px; }
@media (max-width: 900px) {
  .page-heading, .filter-band, .table-band { padding-left: 16px; padding-right: 16px; }
  .page-heading { align-items: flex-start; }
  .filter-grid { grid-template-columns: 1fr 1fr; }
  .filter-actions { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .page-heading { flex-direction: column; }
  .filter-grid { grid-template-columns: 1fr; }
  .filter-actions { grid-column: auto; }
  .table-toolbar { align-items: flex-start; }
}
</style>
