import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useReadLocalStorage } from 'usehooks-ts';
import { deletePet, patchUserProfile } from '../../../api/mutationfn';
import { SERVER_URL } from '../../../api/url';
import Popup from '../../../common/popup/Popup';
import PetInfo from '../../pet/PetInfo';
import PetInfoBox from '../petinfo-box/PetInfoBox';
import {
  Container,
  DeletePet,
  PetCheckFalse,
  PetCheckTrue,
  SettingPet,
} from './petContainer.styled';

interface Prop {
  name: string;
  information: string;
  petId: number;
  sex: string;
  age: number;
  uploadFileURL: string;
  isPetCheck: number | undefined;
  memberId: string;
  setIsPetCheck: React.Dispatch<React.SetStateAction<number>>;

  index: number;
}
// petCheck 여부 확인하기
export default function PetContainer(prop: Prop) {
  const {
    name,
    information,
    petId,
    sex,
    age,
    uploadFileURL,
    setIsPetCheck,
    isPetCheck,
    memberId,
    index,
  } = prop;
  // 유저 정보 refatch
  const queryClient = useQueryClient();

  // 펫 등록 수정 띄위기
  const [isPetOpened, setIsPetOpened] = useState(false);

  // 펫 삭제 확인 팝업 작성
  const [isDeletePopUp, setIsDeletePopUp] = useState(false);
  const accessToken = useReadLocalStorage('accessToken');
  // 펫 삭제 로직 작성
  const deletePetMutation = useMutation({
    mutationFn: deletePet,
    onSuccess() {
      setIsDeletePopUp(false);
      queryClient.invalidateQueries({ queryKey: ['myPage', memberId] });
    },
  });
  const handleDeletePet = () => {
    deletePetMutation.mutate({
      url: `${SERVER_URL}pets/${memberId}/${petId}`,
      token: accessToken as string,
    });
  };
  const handleOpenDeletePopup = () => {
    setIsDeletePopUp(true);
  };
  // 유저 프로필 이미지 변경
  const mutationPatchUserProfile = useMutation({
    mutationFn: patchUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPage', memberId] });
    },
  });
  // 유저 프로필 변경
  const handleChangeUserProfile = (petId: number, index: number) => {
    // 추후 작성
    setIsPetCheck(index);
    mutationPatchUserProfile.mutate({
      url: `${SERVER_URL}members/image/${memberId}/${petId}`,
      accessToken: accessToken as string,
    });
  };

  // 펫 정보 수정
  const handlePetEditPopUp = () => {
    setIsPetOpened(true);
  };

  return (
    <>
      <Container>
        {isPetCheck !== index && (
          <PetCheckFalse
            onClick={() => handleChangeUserProfile(petId, index)}
          />
        )}
        {isPetCheck === index && (
          <PetCheckTrue onClick={() => handleChangeUserProfile(petId, index)} />
        )}
        <PetInfoBox
          name={name}
          uploadFileURL={uploadFileURL}
          information={information}
          sex={sex}
        />
        <DeletePet onClick={handleOpenDeletePopup} />
        <SettingPet onClick={handlePetEditPopUp} />
      </Container>
      {isPetOpened && (
        <PetInfo
          method="patch"
          isOpend={isPetOpened}
          setIsOpened={setIsPetOpened}
          petId={petId}
          profile={uploadFileURL}
          name={name}
          age={age}
          sex={sex}
          information={information}
        />
      )}
      {isDeletePopUp && (
        <Popup
          title="해당 등록을 삭제하시겠습니까?"
          btnsize={['md', 'md']}
          buttontext={['삭제', '취소']}
          countbtn={2}
          isgreen={['true', 'false']}
          popupcontrol={() => {
            setIsDeletePopUp(false);
          }}
          handler={[
            handleDeletePet,
            () => {
              setIsDeletePopUp(false);
            },
          ]}
        />
      )}
    </>
  );
}
