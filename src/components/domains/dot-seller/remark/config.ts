import {
  SocialRemarkMessageAction,
  SocialRemarkMessageProtocolName,
  SocialRemarkMessageVersion
} from './types';

export type SocialRemarkConfigData = {
  protNames?: SocialRemarkMessageProtocolName[];
  actions?: SocialRemarkMessageAction[];
  versions?: SocialRemarkMessageVersion[];
};

export class SocialRemarkConfig {
  private static instance: SocialRemarkConfig;

  private conf: Required<SocialRemarkConfigData> = {
    protNames: ['social_t_0', 'social_t_1', 'social_t_2', 'social'],
    actions: [
      'DMN_REG',
      'DMN_REG_OK',
      'DMN_REG_REFUND',
      'NRG_GEN',
      'NRG_GEN_OK',
      'NRG_GEN_REFUND'
    ],
    versions: ['0.1']
  };

  static getInstance(): SocialRemarkConfig {
    if (!SocialRemarkConfig.instance) {
      SocialRemarkConfig.instance = new SocialRemarkConfig();
    }
    return SocialRemarkConfig.instance;
  }

  public get config() {
    return this.conf;
  }

  public setConfig(data: SocialRemarkConfigData) {
    this.conf = {
      ...this.conf,
      ...data
    };
  }
}
