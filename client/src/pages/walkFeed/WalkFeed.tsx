import { useContext, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useReadLocalStorage } from 'usehooks-ts';
import { SERVER_URL } from '@/api/url.ts';
import { ReactComponent as CommentIcon } from '@/assets/button/comment.svg';
import { ReactComponent as Delete } from '@/assets/button/delete.svg';
import { ReactComponent as Edit } from '@/assets/button/edit.svg';
import { ReactComponent as Calendar } from '@/assets/calendar.svg';
import { ReactComponent as Dog } from '@/assets/dog.svg';
import { ReactComponent as Chatlink } from '@/assets/link.svg';
import { ReactComponent as ArrowLeft } from '@/assets/mobile/arrow-left.svg';
import { ReactComponent as Pin } from '@/assets/pin.svg';
import Comment from '@/common/comment/Comment.tsx';
import AlertText from '@/common/popup/AlertText';
import Popup from '@/common/popup/Popup.tsx';
import LoadingComponent from '@/components/loading/LoadingComponent.tsx';
import ShowMap from '@/components/map-show/ShowMap.tsx';
import NoticeServerError from '@/components/notice/NoticeServerError.tsx';
import useDeleteMutation from '@/hook/api/mutation/useDeleteMutation';
import usePatchMutation from '@/hook/api/mutation/usePatchMutation';
import usePostCommentMutation from '@/hook/api/mutation/usePostCommentMutation';
import useMypageQuery from '@/hook/api/query/useMypageQuery';
import useWalkFeedQuery from '@/hook/api/query/useWalkFeedQuery';
import * as SC from '@/pages/walkFeed/WalkFeed.styled';
import Path from '@/routers/paths.ts';
import { MemberIdContext, State } from '@/store/Context.tsx';
import { changeDateFormat } from '@/util/changeDateFormat.ts';

export function Component() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { memberId: userId } = useContext(MemberIdContext) as State;
  const accessToken = useReadLocalStorage<string | null>('accessToken');

  // 지도 그리기
  // 위도, 경도, 주소
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const [isDeleted, setIsDeleted] = useState(false);

  // 요청 실패 팝업
  const [isOpen, setIsOpen] = useState<[boolean, string]>([false, '']);

  type FormValues = {
    content: string;
  };

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onChange' });

  /* ------------------------------ Query ------------------------------ */
  // 산책 게시글 가지고 오기
  const {
    data,
    isLoading: isFeedLoading,
    isError: isFeedError,
  } = useWalkFeedQuery({
    postId,
    url: `${SERVER_URL}/walkmates/bywalk/${postId}`,
    accessToken,
    type: 'feed',
    successFn: [setAddress, setLat, setLng],
  });

  const reversedData = data ? [...data.comments].reverse() : [];

  const { data: userData, isLoading } = useMypageQuery({
    url: `${SERVER_URL}/members`,
    accessToken,
  });

  /* ------------------------------ Mutation ------------------------------ */
  // 모집 변경
  const walkStatusMutation = usePatchMutation({
    key: ['walkFeed', postId as string],
    errorFn: () => setIsOpen([true, '모집 변경에 실패했습니다.']),
  });

  // 댓글 등록
  const postCommentMutation = usePostCommentMutation({
    keys: [['walkFeed', postId as string], ['walkmateList']],
    errorFn: () => setIsOpen([true, '댓글 생성에 실패했습니다.']),
  });

  const walkDeleteMutation = useDeleteMutation({
    successFn: () => navigate(Path.WalkMate),
    errorFn: () => setIsOpen([true, '게시글 삭제에 실패했습니다.']),
  });

  /* ------------------------------ Handler ------------------------------ */

  const onSubmit: SubmitHandler<FormValues> = data => {
    data = {
      content: data.content.trim(),
    };
    const url = `${SERVER_URL}/walkmates/comments/${postId}`;
    postCommentMutation.mutate({ ...data, url, accessToken });
    resetField('content');
  };

  const handleWalkStatus = () => {
    walkStatusMutation.mutate({
      url: `${SERVER_URL}/walkmates/openstatus/${!data?.open}/${
        data?.walkMatePostId
      }`,
      accessToken,
    });
  };
  const handleWalkFeedEdit = () => {
    // 수정 페이지로 이동
    navigate(`${Path.WalkPosting}/${data?.walkMatePostId}`);
  };

  const handleWalkFeedDeletePopUp = () => {
    setIsDeleted(true);
  };

  const handleWalkFeedDelete = () => {
    walkDeleteMutation.mutate({
      url: `${SERVER_URL}/walkmates/${data?.walkMatePostId}`,
      accessToken,
    });
  };

  useEffect(() => {
    if (!isLoading && !userData?.animalParents) {
      navigate(Path.Home);
    }
  }, [userData, navigate, isLoading]);

  if (isFeedError)
    return (
      <div className="w-screen h-[550px] flex justify-center items-center">
        <NoticeServerError />
      </div>
    );

  if (
    isFeedLoading ||
    walkDeleteMutation.isLoading ||
    walkStatusMutation.isLoading
  )
    return <LoadingComponent />;
  else {
    return (
      <>
        <div className="w-[500px] max-sm:w-[320px] mx-auto mt-7">
          <ArrowLeft
            className="hidden max-sm:block w-6 h-6 cursor-pointer"
            onClick={() => navigate(Path.WalkMate)}
          />
          {`${data?.memberInfo?.memberId}` === userId && (
            <div className="flex justify-end gap-4 items-center">
              <button
                className="bg-deepgreen px-2 py-1 rounded-md text-white"
                onClick={handleWalkStatus}>
                모집변경
              </button>
              <Edit
                className="cursor-pointer"
                onClick={handleWalkFeedEdit}
                stroke="black"
              />
              <Delete
                className="cursor-pointer"
                onClick={handleWalkFeedDeletePopUp}
                stroke="black"
              />
            </div>
          )}
          {/* 제목부분 */}
          <div className="flex items-baseline gap-3 text-3xl font-[900] justify-start mb-7 mt-3">
            <SC.GatherMate isopen={data?.open ? 'true' : 'false'}>
              {data?.open ? '모집중' : '모집완료'}
            </SC.GatherMate>
            <h2 className="max-sm:text-xl">{data?.title}</h2>
          </div>
          {/* 산책정보 안내부분 */}
          <div className="grid grid-cols-2 gap-y-2 max-sm:grid-cols-1 mb-8">
            <SC.WalkInfo>
              <Dog />
              <span>{data?.maximum}마리</span>
            </SC.WalkInfo>
            <SC.WalkInfo>
              <Calendar />
              <span>{changeDateFormat(data?.time as string)}</span>
            </SC.WalkInfo>
            <SC.WalkInfo>
              <Pin />
              <span>{address}</span>
            </SC.WalkInfo>
            <SC.WalkInfo>
              <Chatlink className=" shrink-0" />
              <a href={data?.chatURL as string} target="_blank">
                <span className=" break-all">{data?.chatURL}</span>
              </a>
            </SC.WalkInfo>
          </div>
          {/* 본문 */}
          <div className="mb-7">{data?.content}</div>
          {/* 지도 이미지 부분 */}
          <ShowMap address={address} lat={lat} lng={lng} />

          <SC.Divider />
          {/* 댓글 */}
          <div className="mt-5">
            <div className="flex items-center gap-1 text-deepgray mb-3">
              <CommentIcon className=" stroke-deepgray" />
              <span>댓글 {data?.comments?.length}</span>
            </div>
            {/* 댓글입력창 */}
            <form
              className="flex justify-between gap-2"
              onSubmit={handleSubmit(onSubmit)}>
              <input
                className=" w-full border-b border-lightgray bg-transparent outline-none"
                type="text"
                {...register('content', {
                  required: '댓글 작성시 텍스트 필수',
                  maxLength: {
                    value: 100,
                    message: '100자 이내로 입력해주세요 :)',
                  },
                  validate: value => value.trim().length !== 0 || '공백만 안됨',
                })}
              />

              <SC.CommentButton
                disabled={!!errors.content?.message}
                className={
                  errors.content?.message === undefined
                    ? 'bg-deepgreen'
                    : 'bg-lightgray'
                }>
                Comment
              </SC.CommentButton>
            </form>
            {/* 댓글 렌더링 */}
            <ul>
              {reversedData.map(comment => {
                return (
                  <Comment
                    key={comment.walkMateCommentId}
                    content={comment.content}
                    createdAt={comment.createdAt}
                    modifiedAt={comment.modifiedAt}
                    memberInfo={comment.memberInfo}
                    walkMateCommentId={comment.walkMateCommentId}
                    walkMatePostId={postId}
                    type={'walk'}
                  />
                );
              })}
            </ul>
          </div>
        </div>
        <>
          {isDeleted && (
            <Popup
              title={AlertText.Delete}
              countbtn={2}
              popupcontrol={() => {
                setIsDeleted(false);
              }}
              handler={[
                handleWalkFeedDelete,
                () => {
                  setIsDeleted(false);
                },
              ]}
            />
          )}
          {isOpen[0] && (
            <Popup
              title={isOpen[1]}
              popupcontrol={() => {
                setIsOpen([false, '']);
              }}
              handler={[
                () => {
                  setIsOpen([false, '']);
                },
              ]}
            />
          )}
        </>
      </>
    );
  }
}

Component.displayName = 'WalkFeed';
