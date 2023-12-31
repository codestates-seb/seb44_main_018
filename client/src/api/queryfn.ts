import axios from 'axios';
import { ZIP_URL } from '@/api/url';

// 쿼리함수를 관리합니다.

//시군구 정보 가져오기
export const getLocal = async (pattern: string) => {
  const result = await axios.get(`${ZIP_URL}${pattern}`);
  return result.data;
};

/* -------------------------------- 서버에서 데이터 가지고 오기 ------------------------------- */

export const getServerData = async (url: string) => {
  const result = await axios.get(url);
  return result.data;
};

/* -------------------------------- 서버에서 데이터 가지고 오기 with jwt ------------------------------- */

export const getServerDataWithJwt = async (
  url: string,
  token: string | null | undefined,
) => {
  const result = await axios.get(url, {
    headers: {
      Authorization: token,
    },
  });
  return result.data;
};

/* -------------------------------- 게스트 피드리스트 가져오기 ------------------------------- */
export const getGuestFeedList = async (url: string) => {
  const result = await axios.post(url);
  return result.data.responseList;
};

/* -------------------------------- 기존 유저 피드리스트 가져오기 ------------------------------- */
export const getHostFeedList = async (
  url: string,
  token: string | null | undefined,
) => {
  const result = await axios.post(
    url,
    {},
    {
      headers: {
        Authorization: token,
      },
    },
  );
  return result.data.responseList;
};

/* ------------------- 서버에서 데이터 가지고 오기 with jwt 무한 스크롤을 위한 데이터 ------------------------------- */

export const getServerDataWithJwtScroll = async (
  url: string,
  token: string | null | undefined,
) => {
  const result = await getServerDataWithJwt(url, token);
  return result.responseList;
};
