var swiper_knowledge;
let knowledgeArr;
let knowledgeCategoryArr = [];
let knowledgeQty = 0;
let arrKm;
$(function () {
  $(".main_home_menu_item_wrapper img")
    .eq(1)
    .on("click", function () {
      loading.show();
      var status = navigator.onLine;
      if (status) {
        getKnowledge()
          .then((res) => {
            knowledgeArr = res.data.data.map((row, index) => ({
              ...row,
              knowledgeNo: index + 1,
            }));

            knowledgeCategoryArr = res.data.categoryList;
            loading.hide();
            changePage("knowledge_page", function () {
              initialKnowledgePageFunc();
            });
          })
          .catch((err) => {
            knowledgeArr = [];
            knowledgeCategoryArr = [];
            loading.hide();
            changePage("knowledge_page", function () {
              initialKnowledgePageFunc();
            });
          });
      } else {
        alert("กรุณาเชื่อมต่ออินเตอร์เน็ต");
        loading.hide();
      }
    });
});
//getKnowledge
function getKnowledge() {
  return new Promise((resolve, reject) => {
    callAPI(
      `${api_base_url}/getKm`,
      "POST",
      JSON.stringify({ token: token.getUserToken() }),
      (res) => {
        resolve(res);
      },
      (err) => {
        reject(err);
      }
    );
  });
}
// ปุ่ม back
$("#knowledge_page .urgent_noti_page_header .back_header_btn").on(
  "click",
  function () {
    if ($(".search_header").hasClass("active")) {
      initialKnowledgePageFunc();
      searchremoveClass();
    } else {
      changePage("home_page", function () {});
    }
  }
);

// initialKnowledgePageFunc
function initialKnowledgePageFunc() {
  $(".content").animate(
    {
      scrollTop: $(".content").offset().top,
    },
    0
  );
  initialSearchHeaderFunc();
  $("#knowledge_page .content .slide-bar").empty();
  $("#knowledge_page .content .slide-bar").append(
    renderKnowledgeHeader(knowledgeCategoryArr)
  );
  $("#knowledge_page .content .slide-bar .swiper-slide")
    .eq(0)
    .addClass("active");
  initSlideKnowledgePage();
  filterKnowledgeCard(
    $("#knowledge_page .content .slide-bar .swiper-slide").eq(0).text()
  );
  $("#knowledge_page .content .slide-bar .swiper-slide").on(
    "click",
    function () {
      $("#knowledge_page .content .slide-bar .swiper-slide").removeClass(
        "active"
      );
      $(this).addClass("active");
      filterKnowledgeCard($(this).text());
    }
  );
}

function filterKnowledgeCard(category) {
  arrKm = knowledgeArr.filter((a) => a.category == category);
  knowledgeQty = arrKm.length;
  arrKm = arrKm.map((row, index) => ({
    ...row,
    knowledgeNo: index + 1,
  }));
  $("#knowledge_page ul.news_item").html("");
  arrKm.map((row, index) =>
    $("#knowledge_page ul.news_item").append(renderKnowledgeCard(row, index))
  );
  $("#knowledge_page .content .sort-bar span").text(knowledgeQty + " รายการ");
  // cilck card knowledge
  $("#knowledge_page .news_item li").on("click", function () {
    let knowledgeNo = $(this).attr("knowledgeNo");
    if (knowledgeNo > 0) {
      gotoKnowledgeDetailPage(knowledgeNo, "knowledge_page");
    }
  });
}

// renderKnowledgeHeader
function renderKnowledgeHeader(arr) {
  let slideKnowledgeHeaderHTML = "";
  $.each(arr, function (index, row) {
    slideKnowledgeHeaderHTML =
      slideKnowledgeHeaderHTML + `<div class="swiper-slide">${row}</div>`;
  });
  return (
    `<div class="swiper swiper_knowledge">
    <div class="swiper-wrapper">` +
    slideKnowledgeHeaderHTML +
    `</div>
    </div>`
  );
}
// initSlideKnowledgePage
function initSlideKnowledgePage() {
  if (swiper_knowledge) {
    swiper_knowledge.destroy();
    swiper_knowledge = null;
  }
  swiper_knowledge = new Swiper(".swiper_knowledge", {
    width: 200,
    speed: 40,
    spaceBetween: 10,
    slidesPerView: 1,
    edgeSwipeThreshold: 20,
  });
}
// renderKnowledgeCard
function renderKnowledgeCard(row, index) {
  let html = `<li knowledgeNo=${index + 1}>
        <img class="news_thumbnail" src="${row.thumbnail}">
        <p class="news_description">${row.header}
        </p>
        <p class="news_date" style="color: #6F63FD"> <img class="knowledge_icon" src="img/knowledge.png"> ${
          row.category
        }</p>
        <img class="news_detail_btn" style="width: 90px;" src="img/news_detail_btn.png">
      </li>`;
  return html;
}

function gotoKnowledgeDetailPage(knowledgeNo, from_page) {
  $("#knowledge_detail_page .header .back_header_btn").on("click", function () {
    changePage(from_page, function () {});
  });
  changePage("knowledge_detail_page", function () {
    loading.show();
    $(".content").animate(
      {
        scrollTop: $(".content").offset().top,
      },
      0
    );
    renderKnowledgeDetailContent(knowledgeNo);
    setTimeout(function () {
      loading.hide();
    }, 500);
  });
}
function renderKnowledgeDetailContent(knowledgeNo) {
  function getYoutubeId(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  }
  $(".news_detail_title").html("");
  $(".news_detail_date").html("");
  $(".news_detail_content").html("");
  $(".news_vdo iframe").remove();

  let knowledge_detail = arrKm.find((row) => row.knowledgeNo == knowledgeNo);
  // console.log(knowledge_detail);
  $(".news_detail_title").text(knowledge_detail.header);
  $(".news_detail_date").text(knowledge_detail.category);
  $(".news_detail_content").html(knowledge_detail.detail);

  knowledge_detail.vdoLink.map((row) => {
    var videoid = getYoutubeId(row);
    let obj = $("#knowledge_detail_page .news_vdo");
    console.log(obj);
    let height = Math.floor((obj.width() * 9) / 16);
    let width = obj.width();
    $(
      `<iframe width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`
    )
      .attr("src", "https://www.youtube.com/embed/" + videoid)
      .appendTo(".news_vdo");
  });
}
// ปุ่ม search
$("#knowledge_page .urgent_noti_page_header .search_header").on(
  "click",
  function () {
    if ($(".search_header").hasClass("active")) {
      searchremoveClass();
    } else {
      $("#knowledge_page ul.news_item").html("");
      $("#knowledge_page .content .title-bar").hide();
      $("#knowledge_page .content .slide-bar").hide();
      $("#knowledge_page .content .sort-bar").hide();
      $(".search_header input").addClass("active");
      setTimeout(function () {
        $(".search_header input").focus();
        $(".search_header input").select();
      }, 10);
      $(".search_header input").prop("disabled", false);
      $(".search_header").addClass("active");
      $(".urgent_noti_page_header .title").hide();
      let searchInputKnowledge = document.querySelector(
        "#knowledge_page .search_header input"
      );
      searchInputKnowledge.removeEventListener("input", inputChangeKnowledge);
      searchInputKnowledge.addEventListener("input", inputChangeKnowledge);
    }
  }
);

function inputChangeKnowledge(e) {
  var sreachArr = searchFunction(knowledgeArr, "header", e.target.value);
  arrKm = sreachArr.map((row, index) => ({
    ...row,
    knowledgeNo: index + 1,
  }));
  $("#knowledge_page ul.news_item").html("");
  arrKm.map((row, index) =>
    $("#knowledge_page ul.news_item").append(renderKnowledgeCard(row, index))
  );
  // cilck card knowledge
  $("#knowledge_page .news_item li").on("click", function () {
    let knowledgeNo = $(this).attr("knowledgeNo");
    if (knowledgeNo > 0) {
      gotoKnowledgeDetailPage(knowledgeNo, "knowledge_page");
    }
  });
  if (knowledgeArr.length > 0) {
    $("#qtyitemsearch").show();
    $("#qtyitemsearch").text("ตรงกับที่ค้นหา " + sreachArr.length + " รายการ");
  } else {
    $("#qtyitemsearch").hide();
  }
}
function searchremoveClass() {
  $("#knowledge_page .content .title-bar").show();
  $("#knowledge_page .content .slide-bar").show();
  $("#knowledge_page .content .sort-bar").show();
  $(".search_header input").removeClass("active");
  $(".search_header input").prop("disabled", true);
  $(".search_header").removeClass("active");
  $("#qtyitemsearch").hide();
  $(".urgent_noti_page_header .title").show();
}
