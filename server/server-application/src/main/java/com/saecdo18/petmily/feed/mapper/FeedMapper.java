package com.saecdo18.petmily.feed.mapper;

import com.saecdo18.petmily.feed.dto.FeedCommentDto;
import com.saecdo18.petmily.feed.dto.FeedCommentServiceDto;
import com.saecdo18.petmily.feed.dto.FeedDto;
import com.saecdo18.petmily.feed.dto.FeedServiceDto;
import com.saecdo18.petmily.feed.entity.Feed;
import com.saecdo18.petmily.feed.entity.FeedComments;
import com.saecdo18.petmily.image.dto.ImageDto;
import com.saecdo18.petmily.image.entity.Image;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FeedMapper {
    FeedDto.Response FeedToFeedDtoResponse(Feed feed);
    FeedCommentDto.Response feedCommentsToFeedCommentDto(FeedComments feedComments);

    ImageDto imageToImageDto(Image image);

    FeedServiceDto.PreviousListIds idsToServiceIds(FeedDto.PreviousListIds listIds);

    FeedCommentServiceDto.Post postCommentToServiceDto(FeedCommentDto.Post post);
    FeedCommentServiceDto.Patch patchCommentToServiceDto(FeedCommentDto.Patch post);


}
