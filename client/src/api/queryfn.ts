// eslint-disable-next-line import/named
import axios, { isAxiosError, AxiosResponse } from 'axios';

// 쿼리함수를 관리합니다.

//시군구 정보 가져오기
export const getLocal = async (pattern: string) => {
  const URL =
    'https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes?regcode_pattern=';
  try {
    const result = await axios.get(`${URL}${pattern}`);
    return result.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const errMessage = (error.response as AxiosResponse<{ message: string }>)
        ?.data.message;
      return errMessage;
    }
  }
};