import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useReadLocalStorage } from 'usehooks-ts';
import { getServerDataWithJwt } from '../../api/queryfn';
import { SERVER_URL } from '../../api/url';
import { ReactComponent as Setting } from '../../assets/button/setting.svg';
import { ReactComponent as CommentListIcon } from '../../assets/comment-list.svg';
import { ReactComponent as FeedIcon } from '../../assets/feed.svg';
import { ReactComponent as WalkFeedIcon } from '../../assets/walk-feed.svg';
import Profile from '../../common/profile/Profile';
import WalkCard from '../../components/card/walkCard/walkCard';
import FollowList from '../../components/follow-list/FollowList';
import LoadingComponent from '../../components/loading/LoadingComponent';
import NoticeNoData from '../../components/notice/NoticeNoData';
import NoticeOnlyOwner from '../../components/notice/NoticeOnlyOwner';
import PlusBtn from '../../components/plus-button/PlusBtn';
import PetContainer from '../../components/user_my_page/pet-container/PetContainer';
import { CommentProp } from '../../types/commentType';
import { Feed } from '../../types/feedTypes';
import { Follow, UserInfo } from '../../types/userType';
import { WalkFeed } from '../../types/walkType';
import changeTime from '../../util/changeTiem';
import { CommentList } from '../walkMate/WalkMate.styled';
import {
  Container,
  HightliteText,
  ListBox,
  PetBox,
  TabMenu,
  TabMenuList,
  UserBox,
  UserInfoBox,
  UserName,
  UserNameBox,
  GridContainerFeed,
  GridContainerWalk,
} from './myPage.styled';

export function Component() {
  // userList 보여주기
  const [isListShowed, setIsListShowed] = useState(false);

  // 마이 info 데이터 불러오기
  const memberId = useReadLocalStorage<string>('memberId');
  const accessToken = useReadLocalStorage<string>('accessToken');

  // 유저 정보 조회
  const { data, isLoading } = useQuery<UserInfo>({
    queryKey: ['myPage', memberId],
    queryFn: () =>
      getServerDataWithJwt(
        `${SERVER_URL}members/${memberId}`,
        accessToken as string,
      ),
    onSuccess(data) {
      setUserProfileImage(data.memberInfo.imageURL);
    },
  });

  // 내가 작성한 랜선집사 리스트 가져오기
  const { data: feedData, isLoading: feedLoading } = useQuery<{
    responseList: Feed[];
  }>({
    queryKey: ['myFeed', memberId],
    queryFn: () =>
      getServerDataWithJwt(`${SERVER_URL}feeds/my-feed`, accessToken as string),
  });

  console.log(feedData);

  // 팔로잉 회원 리스트 조회
  const { data: followingData, isLoading: followingLoading } = useQuery<
    Follow[]
  >({
    queryKey: ['followList', memberId],
    queryFn: () =>
      getServerDataWithJwt(
        `${SERVER_URL}members/following/list`,
        accessToken as string,
      ),
    onSuccess(data) {
      console.log(data);
    },
  });
  // 유저이미지
  const [userProfileImage, setUserProfileImage] = useState('');

  // navigate
  const navigate = useNavigate();

  // 유저 정보 수정 페이지로 이동
  const handleUserEdit = () => {
    navigate(`/info/${memberId}`, {
      state: {
        name: data?.name,
        nickname: data?.memberInfo.nickname,
        email: data?.email,
        address: data?.address,
      },
    });
  };

  // 유저 이미지와 일치하는 펫 이미지가 있는지 index를 통해 탐색
  useEffect(() => {
    let indexNumber;
    if (typeof data?.memberInfo === 'object') {
      const userImage = data?.memberInfo.imageURL;
      const petArray = data?.pets.map(({ images }) => images.uploadFileURL);
      indexNumber = petArray?.indexOf(userImage);
      setIsPetCheck(indexNumber);
    }
  }, [data]);

  // 펫 check 여부 확인하기
  const [isPetCheck, setIsPetCheck] = useState(-1);

  // 팔로잉 리스트 보여주기
  const handleOpenFollowingList = () => {
    setIsListShowed(true);
  };

  /* -------------------------------- Tab 컴포넌트 구현 -------------------------------- */
  const [currentTab, setCurrentTab] = useState(0);

  const {
    data: walkFeedData,
    isLoading: walkFeedLoading,
    isError: walkFeedError,
  } = useQuery<WalkFeed[]>({
    queryKey: ['walkFeedList', memberId],
    queryFn: () =>
      getServerDataWithJwt(
        `${SERVER_URL}walkmates/bymember?openFilter=false&page=0&size=10`,
        accessToken as string,
      ),
  });

  const { data: commentListData } = useQuery<CommentProp[]>({
    queryKey: ['commentList', memberId],
    queryFn: () =>
      getServerDataWithJwt(
        `${SERVER_URL}walkmates/comments/bymember`,
        accessToken as string,
      ),
  });

  return (
    <>
      {!(
        !isLoading &&
        !feedLoading &&
        !followingLoading &&
        !walkFeedLoading
      ) ? (
        <LoadingComponent />
      ) : (
        <>
          <Container>
            <UserBox>
              <Profile isgreen="true" size="lg" url={userProfileImage} />
              <UserNameBox className="flex items-center gap-4">
                <UserName>{data?.memberInfo.nickname}</UserName>
                <button>
                  <Setting onClick={handleUserEdit} />
                </button>
              </UserNameBox>
              <UserInfoBox>
                <div>
                  <span>게시물 </span>
                  <HightliteText>
                    {feedData?.responseList.length || 0}
                  </HightliteText>
                </div>
                <div>
                  <span>랜선집사</span>
                  <HightliteText> {data?.followerCount || 0}</HightliteText>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={handleOpenFollowingList}>
                  <span>구독 </span>
                  <HightliteText>{followingData?.length || 0}</HightliteText>
                </div>
              </UserInfoBox>
            </UserBox>
            <PetBox className="hidden">
              {Array.isArray(data?.pets) && (
                <>
                  {data?.pets.map(
                    (
                      {
                        images: { uploadFileURL },
                        name,
                        information,
                        petId,
                        sex,
                        age,
                      },
                      index,
                    ) => (
                      <PetContainer
                        key={petId}
                        name={name}
                        information={information}
                        petId={petId}
                        memberId={memberId as string}
                        sex={sex}
                        age={age}
                        uploadFileURL={uploadFileURL}
                        isPetCheck={isPetCheck}
                        setIsPetCheck={setIsPetCheck}
                        index={index}
                      />
                    ),
                  )}
                </>
              )}
              <PlusBtn />
            </PetBox>
            <ListBox>
              <TabMenu>
                <TabMenuList
                  onClick={() => setCurrentTab(0)}
                  className={
                    currentTab === 0
                      ? `border-t-2 border-t-[green] `
                      : undefined
                  }>
                  <FeedIcon
                    className={currentTab === 0 ? `fill-deepgreen ` : undefined}
                  />
                </TabMenuList>
                <TabMenuList
                  onClick={() => setCurrentTab(1)}
                  className={
                    currentTab === 1
                      ? `border-t-2 border-t-[green] 	`
                      : undefined
                  }>
                  <WalkFeedIcon
                    className={currentTab === 1 ? `fill-deepgreen ` : undefined}
                  />
                </TabMenuList>
                <TabMenuList
                  onClick={() => setCurrentTab(2)}
                  className={
                    currentTab === 2
                      ? `border-t-2 border-t-[green] 	`
                      : undefined
                  }>
                  <CommentListIcon
                    className={currentTab === 2 ? `fill-deepgreen ` : undefined}
                  />
                </TabMenuList>
              </TabMenu>
              <div>
                <div className={currentTab === 0 ? 'block' : 'hidden'}>
                  <div>
                    {!feedData?.responseList.length ? (
                      <>
                        {walkFeedError ? (
                          <div>
                            데이터를 불러오는 과정에서 에러가 발생했습니다.
                          </div>
                        ) : (
                          <NoticeNoData />
                        )}
                      </>
                    ) : (
                      <GridContainerFeed>
                        {feedData?.responseList?.map(item => (
                          <Link to={`/home/${item.feedId}`} key={item.feedId}>
                            <img
                              className="w-full h-[180px] rounded-[28px] object-cover"
                              src={item.images[0].uploadFileURL}
                            />
                          </Link>
                        ))}
                      </GridContainerFeed>
                    )}
                  </div>
                </div>
                <div className={currentTab === 1 ? 'block' : 'hidden'}>
                  {!data?.animalParents ? (
                    <NoticeOnlyOwner />
                  ) : (
                    <div>
                      {!walkFeedData?.length ? (
                        <NoticeNoData />
                      ) : (
                        <GridContainerWalk>
                          {walkFeedData?.map(item => {
                            const { time, content, maximum, location, open } =
                              item;
                            return (
                              <Link
                                to={`/walkmate/${item.walkMatePostId}`}
                                key={item.walkMatePostId}>
                                <WalkCard
                                  size="sm"
                                  time={time}
                                  title={content}
                                  friends={maximum}
                                  location={location}
                                  isclosed={`${open}`}></WalkCard>
                              </Link>
                            );
                          })}
                        </GridContainerWalk>
                      )}
                    </div>
                  )}
                </div>
                <ul className={currentTab === 2 ? 'flex flex-col' : 'hidden'}>
                  {!data?.animalParents ? (
                    <NoticeOnlyOwner />
                  ) : (
                    <div>
                      {!commentListData?.length ? (
                        <NoticeNoData />
                      ) : (
                        commentListData?.map(item => (
                          <Link
                            to={`/walkmate/${item.walkMatePostId}`}
                            key={item.walkMateCommentId}>
                            <CommentList>
                              <span>{item.content}</span>
                              <time className="text-deepgray text-xs">
                                {changeTime(item.createdAt)}
                              </time>
                            </CommentList>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </ul>
              </div>
            </ListBox>
          </Container>
          {isListShowed && (
            <FollowList
              setIsListShowed={setIsListShowed}
              follow={followingData}
            />
          )}
        </>
      )}
    </>
  );
}

Component.displayName = 'MyPage';
