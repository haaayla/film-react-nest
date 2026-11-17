import { ConfigService } from '@nestjs/config';

export const CONFIG = 'CONFIG';

export const configProvider = {
  provide: CONFIG,
  useFactory: (configService: ConfigService): AppConfig => ({
    port: Number(configService.getOrThrow<string>('PORT')),
    database: {
      driver: configService.getOrThrow<string>('DATABASE_DRIVER'),
      url: configService.getOrThrow<string>('DATABASE_URL'),
      username: configService.getOrThrow<string>('DATABASE_USERNAME'),
      password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
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
  username: string;
  password: string;
}
