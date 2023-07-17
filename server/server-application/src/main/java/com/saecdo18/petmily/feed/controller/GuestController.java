package com.saecdo18.petmily.feed.controller;

import com.saecdo18.petmily.feed.dto.FeedDto;
import com.saecdo18.petmily.feed.dto.FeedDtoList;
import com.saecdo18.petmily.feed.dto.FeedServiceDto;
import com.saecdo18.petmily.feed.mapper.FeedMapper;
import com.saecdo18.petmily.feed.service.FeedServiceImpl;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/feeds/all")
@RequiredArgsConstructor
@Api(value = "Feed Guest API 컨트롤러", tags = "Feed Guest API")
public class GuestController {

    private final FeedServiceImpl feedService;

    private final FeedMapper feedMapper;

    @ApiOperation("피드 가져오기")
    @GetMapping("/{feed-id}")
    public ResponseEntity<FeedDto.Response> getFeed(@ApiParam("피드 아이디") @PathVariable("feed-id") long feedId) {
        FeedDto.Response response = feedService.getFeed(feedId, 0);

        return ResponseEntity.ok(response);
    }

    @ApiOperation("최신 피드 리스트 가져오기")
    @PostMapping("/list/random")
    public ResponseEntity<FeedDtoList> getFeedsRandom(@ApiParam("전에 받은 피드 아이디 리스트") @RequestBody FeedDto.PreviousListIds listIds) {
        FeedServiceDto.PreviousListIds previousListIds = feedMapper.idsToServiceIds(listIds);
        FeedDtoList responseList = feedService.getFeedsRecent(previousListIds, 0);
        return ResponseEntity.ok(responseList);
    }
}