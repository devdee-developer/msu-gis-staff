$(function () {
 
    $('#news_page input[type=text]#news_search')
    .focus(function() {
        $('#news_search').addClass('active')
        $('#news_page .search_page').show()
        $('#news_page .back_header_btn').show()
        $('#news_page .back_header_btn').on('click',function(){
            $('#news_search').removeClass('active')
            $('#news_search').val('')
            $('#news_page .search_page').hide()
            $('#news_page .back_header_btn').hide()
            onNewsSearch('')
        })
    }).blur(function() { 
        if($('#news_search').val().length>0){
            $('#news_page .back_header_btn').show()
        }else{
            $('#news_search').removeClass('active')
            $('#news_page .search_page').hide()
            $('#news_page .back_header_btn').hide()
        }
       
    }).keyup(debounce(()=>{
        onNewsSearch($('#news_search').val())
    },500));
    function onNewsSearch(search_text){
        $('.search_page ul.news_item').html('')
        $('.news_match_search_count').text(0)
        if(search_text.length>0){
            let search_list =   news_data_list.filter(row=>row.header.toLowerCase().includes(search_text.toLowerCase())==true )
            search_list.map((row,index)=>$('.search_page ul.news_item').append(renderNewsCard(row,index)))
            $('.news_match_search_count').text(search_list.length) 
            $(".search_page ul.news_item li").on("click", function () {
                let newsno = $(this).attr('newsno')
                if(newsno>0){
                  gotoNewsDetailPage(newsno,'news_page')
                }
              });
        }
    }
})
