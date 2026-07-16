/**
 * HTTP API 客户端
 * 
 * 封装所有 HTTP 请求，统一处理认证和错误
 * 参见 docs/data/api-interfaces.md §二
 */

export interface ApiResponse<T = any> {
  code: number;
  msg?: string;
  data: T;
}

export class ApiClient {
  private baseUrl: string;
  private token: string = '';
  private static readonly API_PREFIX = '/api/v1';

  constructor(baseUrl: string) {
    // 自动去除尾部斜杠，拼接 API 前缀
    this.baseUrl = baseUrl.replace(/\/$/, '') + ApiClient.API_PREFIX;
  }

  /** 设置认证 Token */
  setToken(token: string) {
    this.token = token;
  }

  /** 通用请求方法 */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // 检查 HTTP 状态码
    if (!response.ok) {
      const error = await response.json().catch(() => ({ code: -1, msg: 'network_error' }));
      return error as ApiResponse<T>;
    }

    return response.json();
  }

  /** GET 请求 */
  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path);
  }

  /** POST 请求 */
  async post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  // ============ 账号模块 ============

  async guestLogin(deviceId: string) {
    return this.post('/account/guest_login', {
      device_id: deviceId,
      platform: 'guest',
      client_version: '0.1.0',
    });
  }

  // ============ 档案模块 ============

  async getProfile() {
    return this.get('/profile');
  }

  async getInventory() {
    return this.get('/profile/inventory');
  }

  // ============ 配置模块 ============

  async getConfigVersion() {
    return this.get('/config/version');
  }

  async downloadConfig(version: string) {
    return this.get(`/config/download?version=${version}`);
  }

  // ============ 卡牌模块 ============

  async starUp(cardInstanceId: string, targetStar: number) {
    return this.post('/card/star_up', {
      card_instance_id: cardInstanceId,
      target_star: targetStar,
    });
  }

  async getFormation() {
    return this.get('/card/formation');
  }

  async setFormation(name: string, positions: any[]) {
    return this.post('/card/set_formation', { name, positions });
  }

  // ============ 抽卡模块 ============

  async getPools() {
    return this.get('/gacha/pools');
  }

  async draw(poolId: string, count: number) {
    return this.post('/gacha/draw', { pool_id: poolId, count });
  }
}
