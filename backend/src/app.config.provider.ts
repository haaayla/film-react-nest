import { ConfigService } from '@nestjs/config';

export const CONFIG = 'CONFIG';

export const configProvider = {
  provide: CONFIG,
  useFactory: (configService: ConfigService): AppConfig => ({
    port: Number(configService.getOrThrow<string>('PORT')),
    database: {
      driver: configService.getOrThrow<string>('DATABASE_DRIVER'),
      url: configService.getOrThrow<string>('DATABASE_URL'),
    },
  }),
  inject: [ConfigService],
};

export interface AppConfig {
  port: number;
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: string;
  url: string;
}
