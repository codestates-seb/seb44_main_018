import { useNavigate } from 'react-router-dom';
import LoginPets from '../../assets/illustration/loginpet.png';
import { ErrorText, HomeBtn } from '../../pages/notFound/NotFound.style';

export default function NoticeOnlyOwner() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center">
      <ErrorText>견주만 접근가능합니다.</ErrorText>
      <ErrorText>반려동물 등록하러 갈까요?</ErrorText>
      <img src={LoginPets} className=" w-80" />
      <HomeBtn onClick={() => navigate('/')}>반려동물 등록하러가기</HomeBtn>
    </div>
  );
}
