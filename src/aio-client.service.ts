import { singleton } from 'tsyringe';
import { default as axios, AxiosRequestConfig } from 'axios';
import { Observable } from 'rxjs';
import * as config from './config';

export interface Datum {
  value: any;
  lat?: number;
  lon?: number;
  ele?: number;
  created_at?: Date;
}
@singleton()
export class AIOClient {
  private axios = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
      'X-AIO-Key': config.API_KEY
    },
  });

  private request(data: AxiosRequestConfig) {
    return new Observable(observer => {
      let cancelationTokenSource = axios.CancelToken.source();
      this.axios({
        ...data,
        cancelToken: cancelationTokenSource.token,
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error))

      return () => {
        cancelationTokenSource.cancel()
      }
    });
  }

  public post(url: string, data: Datum) {
    return this.request({
      url,
      data,
      method: 'POST',
    });
  }
}
