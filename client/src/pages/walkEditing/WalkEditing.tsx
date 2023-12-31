import { ErrorMessage } from '@hookform/error-message';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useReadLocalStorage } from 'usehooks-ts';
import { patchWalkFeed } from '@/api/mutationfn.ts';
import { SERVER_URL } from '@/api/url';
import { ReactComponent as Close } from '@/assets/button/close.svg';
import Button from '@/common/button/Button.tsx';
import * as SC from '@/common/input/Input.styled';
import AlertText from '@/common/popup/AlertText';
import Popup from '@/common/popup/Popup.tsx';
import { Textarea } from '@/components/card/feedwritecard/FeedWriteCard.styled.tsx';
import LoadingComponent from '@/components/loading/LoadingComponent.tsx';
import Map from '@/components/map-make/Map.tsx';
import useMypageQuery from '@/hook/api/query/useMypageQuery';
import useWalkFeedQuery from '@/hook/api/query/useWalkFeedQuery';
import { PostForm } from '@/pages/walkPosting/WalkPosting.styled.tsx';
import Path from '@/routers/paths';
import { WalkFeed } from '@/types/walkType.ts';

interface Inputs {
  title: string;
  time: string;
  location: string;
  chatURL: string;
  maximum: number;
  content: string;
}

export function Component() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const accessToken = useReadLocalStorage<string | null>('accessToken');

  // 주소 값 저장하기
  const [mainAddress, setMainAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ La: 0, Ma: 0 });

  // PopUpController
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  /* ------------------------------ Query ------------------------------ */
  // 산책 게시물 불러오기
  const { data, isLoading } = useWalkFeedQuery({
    postId,
    url: `${SERVER_URL}/walkmates/bywalk/${postId}`,
    type: 'edit',
    accessToken,
    successFn: [setMainAddress, setDetailAddress],
    errorFn: true,
  });

  // 유저 login, pet 여부 검사
  const { data: userData, isLoading: userLoading } = useMypageQuery({
    url: `${SERVER_URL}/members`,
    accessToken,
  });

  /* ------------------------------ Mutation ------------------------------ */
  // 산책게시물 수정
  const walkPatchFillMutation = useMutation({
    mutationFn: patchWalkFeed,
    onSuccess: (data: WalkFeed) => {
      const walkId = data.walkMatePostId;
      navigate(`${Path.WalkMate}/${walkId}`);
    },
    onError: () => {
      setIsError(true);
    },
  });

  const onSumbit = (body: Inputs) => {
    const obj = {
      ...body,
      mapURL: `${coordinates.La} ${coordinates.Ma} ${detailAddress}`,
      open: true,
      accessToken: accessToken as string,
      walkId: data?.walkMatePostId as number,
    };

    walkPatchFillMutation.mutate(obj);
  };

  useEffect(() => {
    if (!userLoading && !userData?.animalParents) {
      navigate(Path.Home);
    }
  }, [userData, navigate, userLoading]);

  return (
    <>
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <>
          <main>
            <div className="flex items-center justify-center gap-7 mt-16 mb-7">
              <h2 className=" text-defaulttext font-[800] text-2xl">
                산책 메이트 글쓰기
              </h2>
              <Close
                className=" stroke-defaulttext fill-defaulttext w-6 h-6 cursor-pointer"
                onClick={() => navigate(-1)}
              />
            </div>

            <PostForm onSubmit={handleSubmit(onSumbit)}>
              {/* 제목 */}
              <SC.InputContainer>
                <SC.Label htmlFor="title">제목</SC.Label>
                <SC.InputText
                  id="title"
                  defaultValue={data?.title ? data?.title : ''}
                  {...register('title', {
                    required: '텍스트 필수입니다.',
                    maxLength: {
                      value: 20,
                      message: '20자 이내로 작성해주세요 ;)',
                    },
                  })}
                  error={errors.title?.message}
                />
                <ErrorMessage
                  errors={errors}
                  name="title"
                  render={({ message }) => (
                    <SC.ErrorNotice>{message}</SC.ErrorNotice>
                  )}
                />
              </SC.InputContainer>

              {/* 날짜 */}
              <SC.InputContainer>
                <SC.Label htmlFor="time">날짜를 선택해주세요</SC.Label>
                <SC.InputText
                  id="time"
                  className=" cursor-pointer"
                  type="datetime-local"
                  defaultValue={data?.time ? data?.time : ''}
                  {...register('time', {
                    required: '날짜도 필수입니다.',
                    maxLength: {
                      value: 20,
                      message: '20자 이내로 작성해주세요 ;)',
                    },
                  })}
                  error={errors.time?.message}
                />
                <ErrorMessage
                  errors={errors}
                  name="time"
                  render={({ message }) => (
                    <SC.ErrorNotice>{message}</SC.ErrorNotice>
                  )}
                />
              </SC.InputContainer>

              {/* 장소 */}
              <SC.InputContainer>
                <SC.Label htmlFor="location">산책 장소를 알려주세요</SC.Label>
                <SC.InputText
                  className=" cursor-pointer"
                  id="location"
                  type="text"
                  readOnly
                  value={`${mainAddress} ${detailAddress}`}
                  {...register('location', {
                    required: '장소를 선택해주세요!',
                    value: `${mainAddress}`,
                  })}
                  error={errors.location?.message}
                />
                <ErrorMessage
                  errors={errors}
                  name="location"
                  render={({ message }) => (
                    <SC.ErrorNotice>{message}</SC.ErrorNotice>
                  )}
                />
              </SC.InputContainer>
              <Map
                mainAddress={mainAddress}
                setMainAddress={setMainAddress}
                setDetailAddress={setDetailAddress}
                setCoordinates={setCoordinates}
              />
              {/* 오픈채팅 url */}
              <SC.InputContainer>
                <SC.Label htmlFor="chatURL">오픈채팅방 링크</SC.Label>
                <SC.InputText
                  id="chatURL"
                  type="text"
                  placeholder="(필수X)채팅방 링크가 있다면 입력해주세요:) "
                  defaultValue={data?.chatURL ? data?.chatURL : ''}
                  {...register('chatURL', {
                    pattern: {
                      value: /^(http|https):\/\//gm,
                      message: 'http://, https:// 시작해야 합니다.',
                    },
                  })}
                  error={errors.chatURL?.message}
                />
                <ErrorMessage
                  errors={errors}
                  name="chatURL"
                  render={({ message }) => (
                    <SC.ErrorNotice>{message}</SC.ErrorNotice>
                  )}
                />
              </SC.InputContainer>

              {/* 산책 마리수 */}
              <SC.InputContainer>
                <SC.Label htmlFor="maximum">
                  산책 친구들은 몇 마리면 좋을까요?
                </SC.Label>
                <SC.InputText
                  id="maximum"
                  type="number"
                  defaultValue={data?.maximum ? data?.maximum : 0}
                  {...register('maximum', {
                    required: '필수',
                    min: {
                      value: 1,
                      message: '1마리 이상이어야해요!',
                    },
                    max: {
                      value: 101,
                      message: '101마리 이하',
                    },
                  })}
                  error={errors.maximum?.message}
                />
                <ErrorMessage
                  errors={errors}
                  name="maximum"
                  render={({ message }) => (
                    <SC.ErrorNotice>{message}</SC.ErrorNotice>
                  )}
                />
              </SC.InputContainer>

              {/* 텍스트 입력창 */}
              <Textarea
                placeholder="글을 작성해주세요"
                defaultValue={data?.content ? data?.content : ''}
                {...register('content', {
                  maxLength: 300,
                })}
              />

              <Button size="lg" text="게시물 수정" isgreen="true" />
            </PostForm>
          </main>
          {isError && (
            <Popup
              title={AlertText.Failed}
              popupcontrol={() => {
                setIsError(false);
              }}
              handler={[
                () => {
                  setIsError(false);
                },
              ]}
            />
          )}
        </>
      )}
    </>
  );
}

Component.displayName = 'WalkEditing';
