import { useNavigate } from 'react-router-dom';
import Cat404 from '@/assets/illustration/404cat.png';
import * as SC from '@/pages/notFound/NotFound.styled.tsx';
import Path from '@/routers/paths.ts';

export default function NoticeServerError() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center">
      <SC.ErrorText>
        데이터를 불러오는 과정에서 에러가 발생했습니다.
      </SC.ErrorText>
      <img src={Cat404} className=" w-80" />
      <SC.HomeBtn onClick={() => navigate(Path.Home)}>
        홈으로 돌아가기
      </SC.HomeBtn>
    </div>
  );
}
