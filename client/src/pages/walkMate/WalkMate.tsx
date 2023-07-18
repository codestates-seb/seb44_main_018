import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useReadLocalStorage } from 'usehooks-ts';
import { getServerDataWithJwt } from '../../api/queryfn';
import { SERVER_URL } from '../../api/url';
import { ReactComponent as Plus } from '../../assets/button/plus.svg';
import { GridContainer } from '../../common/grid/Grid.styled';
import Select from '../../common/select/Select';
import WalkCard from '../../components/card/walk-card/walkCard';
import { CardContainer } from '../../components/card/walk-card/walkCard.styled';
import LoadingComponent from '../../components/loading/LoadingComponent';
import Path from '../../routers/paths';
import { WalkFeed } from '../../types/walkType';
import { changeDateFormat } from '../../util/changeDateFormat';
import { SearchButton } from './WalkMate.styled';

export function Component() {
  // 주소 값 받아오기
  const [zip, setZip] = useState('서울');

  const accessToken = useReadLocalStorage<string | null>('accessToken');

  /* ---------------------------- useInfiniteQuery ---------------------------- */
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    // isError,
  } = useInfiniteQuery<WalkFeed[]>({
    queryKey: ['walkmateList', 'key'],
    queryFn: ({ pageParam = 0 }) => {
      return getServerDataWithJwt(
        `${SERVER_URL}/walkmates/walks?openFilter=false&location=${zip}&page=${pageParam}&size=10`,
        accessToken as string,
      );
    },

    getNextPageParam: (_, allPages) => {
      const len = allPages.length;
      const totalLength = allPages.length;
      return allPages[totalLength - 1].length === 0 ? undefined : len;
    },

    enabled: !!zip,
  });

  const handleClickSearchAddress = () => {
    refetch();
  };
  console.log(data?.pages, 'walkmate');

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="mt-10 items-center flex flex-col justify-center">
      <div className=" flex justify-end max-sm:justify-center gap-4 ">
        <Select size="md" direction="row" setZip={setZip} />
        <SearchButton onClick={handleClickSearchAddress}>검색</SearchButton>
      </div>
      <GridContainer>
        <Link to={Path.WalkPosting}>
          <CardContainer size="lg" className="items-center justify-center">
            <Plus className=" w-8 h-8" />
          </CardContainer>
        </Link>
        {Array.isArray(data?.pages[0]) &&
          data?.pages.map((page, index) => (
            <React.Fragment key={index}>
              {page.map(item => (
                <Link
                  to={`/walkmate/${item.walkMatePostId}`}
                  key={item.walkMatePostId}>
                  <WalkCard
                    size="lg"
                    time={changeDateFormat(item.time)}
                    title={item.title}
                    friends={item.maximum}
                    location={item.location}
                    isclosed={`${item.open}`}
                    nickname={item.memberInfo.nickname}
                    imageURL={item.memberInfo.imageURL}
                    key={item.walkMatePostId}
                  />
                </Link>
              ))}
            </React.Fragment>
          ))}
      </GridContainer>
      <div ref={ref}></div>
    </div>
  );
}

Component.displayName = 'WalkMate';
