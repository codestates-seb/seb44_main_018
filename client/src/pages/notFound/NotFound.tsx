import {
  isRouteErrorResponse,
  useRouteError,
  useNavigate,
} from 'react-router-dom';
import { ReactComponent as Error404 } from '@/assets/404.svg';
import Cat404 from '@/assets/illustration/404cat.png';
import Footer from '@/common/footer/Footer.tsx';
import * as SC from '@/pages/notFound/NotFound.styled.tsx';
import Path from '@/routers/paths.ts';

export default function NotFound() {
  const navigate = useNavigate();
  const error = useRouteError();

  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorMessage = error.error?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
  }

  return (
    <SC.Container>
      <Error404 width={300} height={100} />
      <img src={Cat404} width="300" />
      <div>
        <SC.ErrorText>죄송합니다. 페이지를 찾을 수 없습니다.</SC.ErrorText>
        <SC.ErrorMessage>{errorMessage}</SC.ErrorMessage>
      </div>
      <SC.HomeBtn onClick={() => navigate(Path.Login)}>
        홈으로 돌아가기
      </SC.HomeBtn>
      <Footer />
    </SC.Container>
  );
}
