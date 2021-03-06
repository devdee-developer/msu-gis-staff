function changePage(_page, _callback = function () {}) {
  $(".pages").hide();
  $("#" + _page).show();
  _callback();
}

function initSlideHomePage() {
  $(".home_slider_wrapper .swiper-wrapper").html("");
  loading.show();
  getNews().then((news) => {
    loading.hide();
    clearInterval(swiper_timer);
    swiper = new Swiper(".mySwiper", {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      speed: 500,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });
    swiper_timer = setInterval(function () {
      swiper.slideNext();
    }, 5000);
  });
}
function initSlideNewsPage() {
  $(".home_slider_wrapper .swiper-wrapper").html("");
  $(".news_slider_wrapper .swiper-wrapper").html("");
  loading.show();

  getNews().then((news) => {
    loading.hide();
    clearInterval(swiper_timer2);
    swiper2 = new Swiper(".mySwiper2", {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      pagination: {
        el: ".swiper-pagination2",
        clickable: true,
      },
    });
    swiper_timer2 = setInterval(function () {
      swiper2.slideNext();
    }, 5000);
    let data = news.data;
    $("ul.news_item").html("");
    if (news.status == false) {
    } else {
      data.map((row, index) =>
        $(".content ul.news_item").append(renderNewsCard(row, index))
      );
    }

    $(".content ul.news_item li").on("click", function () {
      let newsno = $(this).attr("newsno");
      if (newsno > 0) {
        gotoNewsDetailPage(newsno, "news_page");
      }
    });
  });
}
function gotoNewsDetailPage(newsno, from_page) {
  $("#news_detail_page .header .back_header_btn").on("click", function () {
    $("#news_page .back_header_btn").unbind();
    $("#news_page .back_header_btn").on("click", function () {
      $("#home_page .footer_item.menu_home_page").click();
    });
    changePage(from_page, function () {});
  });
  changePage("news_detail_page", function () {
    loading.show();
    $(".content").animate(
      {
        scrollTop: $(".content").offset().top,
      },
      0
    );
    renderNewsDetailContent(newsno);
    setTimeout(function () {
      loading.hide();
    }, 500);
  });
}
function getNews() {
  return new Promise((resolve, reject) => {
    callAPI(
      `${api_base_url}/getNews`,
      "POST",
      JSON.stringify({ token: token.getUserToken() }),
      (success) => {
        console.log(success);
        $(".home_slider_wrapper .swiper-wrapper").html("");
        $(".news_slider_wrapper .swiper-wrapper").html("");
        news_data_list = success.data.newsList.map((row, index) => ({
          ...row,
          newsno: index + 1,
        }));
        let slideNews = news_data_list.filter((row) => row.slide == true);
        let rapidNews = news_data_list.find((row) => row.reddit == true);
        if (rapidNews) {
          $(".home_knowledge_base").attr("newsno", rapidNews.newsno);
          $(".home_knowledge_base").html(
            ` <i class="fa fa-comment-alt comment_icon_home"></i><p>${rapidNews.header}</p>`
          );
          $(".home_knowledge_base").on("click", function () {
            let newsno = $(this).attr("newsno");
            if (newsno > 0) {
              gotoNewsDetailPage(newsno, "home_page");
            }
          });
        } else {
          $(".home_knowledge_base").html(
            ` <i class="fa fa-comment-alt comment_icon_home"></i>???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? ???????????????????????????????????????????????????`
          );
        }
        slideNews.map((row, index) => {
          $(".home_slider_wrapper .swiper-wrapper").append(
            `<div class="swiper-slide news" newsno="${row.newsno}"><img newsno="${row.newsno}" src="${row.banner}" /></div>`
          );
          $(".news_slider_wrapper .swiper-wrapper").append(
            `<div class="swiper-slide news" newsno="${row.newsno}"><img newsno="${row.newsno}" src="${row.banner}" /></div>`
          );
        });
        if (slideNews.length != 0) {
          $(
            ".home_slider_wrapper .swiper-slide.news,.home_slider_wrapper .swiper-slide.news img"
          ).on("click", function () {
            let newsno = $(this).attr("newsno");
            if (newsno > 0) {
              gotoNewsDetailPage(newsno, "home_page");
            }
          });
          $(
            ".news_slider_wrapper .swiper-slide.news,.news_slider_wrapper .swiper-slide.news img"
          ).on("click", function () {
            let newsno = $(this).attr("newsno");
            if (newsno > 0) {
              gotoNewsDetailPage(newsno, "news_page");
            }
          });
        } else {
          news_data_list = [
            { banner: "img/no_news.jpg" },
            { banner: "img/no_news2.jpg" },
          ];
          news_data_list.map((row) => {
            $(".home_slider_wrapper .swiper-wrapper").append(
              `<div class="swiper-slide news"><img src="${row.banner}" /></div>`
            );
            $(".news_slider_wrapper .swiper-wrapper").append(
              `<div class="swiper-slide news"><img src="${row.banner}" /></div>`
            );
          });
        }
        resolve({ status: true, data: news_data_list });
      },
      (error) => {
        $(".home_knowledge_base").html(
          ` <i class="fa fa-comment-alt comment_icon_home"></i>???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? ???????????????????????????????????????????????????`
        );
        if (error.status == 500) {
          news_data_list = [
            { banner: "img/no_news.jpg" },
            { banner: "img/no_news2.jpg" },
          ];
          news_data_list.map((row) => {
            $(".home_slider_wrapper .swiper-wrapper").append(
              `<div class="swiper-slide news"><img src="${row.banner}" /></div>`
            );
            $(".news_slider_wrapper .swiper-wrapper").append(
              `<div class="swiper-slide news"><img src="${row.banner}" /></div>`
            );
          });
        } else {
          news_data_list = [
            { banner: "img/news-no-network2.jpg" },
            { banner: "img/news-no-network.jpg" },
          ];
          news_data_list.map((row) => {
            $(".home_slider_wrapper .swiper-wrapper").append(
              `<div class="swiper-slide news"><img src="${row.banner}" /></div>`
            );
            $(".news_slider_wrapper .swiper-wrapper").append(
              `<div class="swiper-slide news"><img src="${row.banner}" /></div>`
            );
          });
        }

        loading.hide();
        resolve({ status: false, data: news_data_list });
      }
    );
  });
}
function renderNewsCard(row, index) {
  let html = `<li newsno="${row.newsno}">
      <img class="news_thumbnail" src="${row.thumbnail}">
      <p class="news_description">
        ${row.header}
      </p>
      <p class="news_date"> <i class="fa fa-calendar"></i> ${dateFullStringFormat(
        row.publicDate
      )}</p>
      <img class="news_detail_btn" src="img/news_detail_btn.png">
    </li>`;
  return html;
}
function renderNewsDetailContent(newsno) {
  function getYoutubeId(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  }
  $(".news_detail_title").html("");
  $(".news_detail_banner img").remove();

  $(".news_detail_date").html("");
  $(".news_detail_content").html("");
  $(".news_vdo iframe").remove();

  let news_detail = news_data_list.find((row) => row.newsno == newsno);
  $(".news_detail_title").text(news_detail.header);
  $(".news_detail_banner").append(`<img src="${news_detail.banner}"/>`);
  $(".news_detail_date").text(dateFullStringFormat(news_detail.publicDate));
  $(".news_detail_content").html(news_detail.detail);

  news_detail.vdoLink.map((row) => {
    var videoid = getYoutubeId(row);
    let obj = $(".news_vdo");
    let height = Math.floor((obj.width() * 9) / 16);
    let width = obj.width();
    $(
      `<iframe width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`
    )
      .attr("src", "https://www.youtube.com/embed/" + videoid)
      .appendTo(".news_vdo");
  });
}
function calHomeButtonPosition() {
  var total_w = $(".main_home_menu_item_wrapper").width();
  var _w = total_w / 2 - 5;
  $(".main_home_menu_item_wrapper img").width(_w);
  $(".main_home_menu_item_wrapper img").eq(1).css("margin-left", "10px");
  $(".main_home_menu_item_wrapper img").eq(3).css("margin-left", "10px");
}
function setProfile() {
  $(".profile_header_wrapper img").remove();
  let profile = JSON.parse(localStorage.getItem("profile"));
  console.log(profile);
  function id_card_format(idcard) {
    idcard = idcard.split("");
    let return_text = `${idcard[0]}-${idcard[1]}${idcard[2]}${idcard[3]}${idcard[4]}-${idcard[5]}${idcard[6]}${idcard[7]}${idcard[8]}${idcard[9]}-${idcard[10]}${idcard[11]}-${idcard[12]}`;

    return return_text;
  }
  if (profile.VHV_SEX == 2) {
    $(".profile_header_wrapper").append('<img src ="img/staff_icon.png"/>');
    $(".card_header_profile .card_header_thumbnail").attr(
      "src",
      "img/staff_icon.png"
    );
  } else {
    $(".profile_header_wrapper").append('<img src ="img/staff_icon.png"/>');

    $(".card_header_profile .card_header_thumbnail").attr(
      "src",
      "img/staff_icon.png"
    );
  }

  $(".vhv_user").html(`<b>${profile.ADMIN_NAME}</b>`);
  $(".vhv_occupation").text(
    `${profile.ADMIN_OCCUPATION ? profile.ADMIN_OCCUPATION : ""}`
  );
  $(".vhv_position").html(
    `${profile.ADMIN_POSITION ? profile.ADMIN_POSITION : "?????????????????????"}`
  );
  // $(".vhv_age").text(getAge(profile.VHV_BIRTHDATE, true));
  // $(".vhv_idcard").text(id_card_format(profile.VHV_IDCARD));
  // $(".vhv_addr").text(`?????????????????? ${profile.VHV_ADDR}`);
  // $(".vhv_age").text('????????????');
  // $(".vhv_idcard").text('');
  // $(".vhv_addr").text(`?????????????????? `);
  $(".header_notification").show();
  // queryALL("VHV_MA_SHPH", function (vhv_ma_shph) {
  //   let shph = vhv_ma_shph[0];
  $(".vhv_shph").text(`${profile.SHPH_NAME}`);
  // $(".vhv_shph").text(`???????????????`);
  // });
  // queryALL("VHV_MA_SHPH_MOO", function (vhv_ma_shph_moo) {
  //   let shph_moo = vhv_ma_shph_moo[0];
  //   $(".vhv_community").text(`???????????????${shph_moo.SHPH_MOONAME}`);
  // });
}
function getProfile() {
  let profile = JSON.parse(localStorage.getItem("profile"));
  return profile;
}
function showModal(_modal, _callback = function () {}) {
  $("#" + _modal).fadeIn(200, () => {
    $("body").addClass("modal-open");
  });
  _callback();
}
function getAccessToken(_success, _error) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: api_base_url + "/auth/login",
      type: "POST",
      data: {
        partner_id: partner_id,
        partner_key: partner_key,
      },
      success: function (response) {
        localStorage.setItem("access_token", response.access_token);
        resolve(response.access_token);
      },
      error: function () {
        reject("??????????????????????????????????????????3");
      },
    });
  });
}
async function login(
  username,
  password,
  lat,
  long,
  noti_token,
  _success,
  _error
) {
  try {
    await getAccessToken();
    $.ajax({
      url: api_base_url + "/adminLogin",
      type: "POST",
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "Authorization",
          "Bearer " + token.getAccessToken()
        );
      },
      data: {
        user: username,
        pass: password,
        lat: lat,
        long: long,
        noti_token: noti_token,
      },
      success: function (response) {
        console.log(response);
        if (response.status == true) {
          localStorage.setItem("noti_token", noti_token);
          localStorage.setItem("user_token", response.data);
          _success(response);
        } else {
          _error(response.status);
        }
      },
      error: function (e) {
        if (e.responseJSON.status == false) {
          _error("?????????????????????????????? ???????????? ???????????????????????? ??????????????????????????????");
        } else {
          _error("??????????????????????????????????????????4");
        }
      },
    });
  } catch (error) {
    _error(
      "???????????????????????????????????? ????????????????????????????????????????????????????????? ????????????????????????????????????????????????????????????????????? ???????????????????????????????????? ?????????????????????????????????????????????????????????????????????"
    );
  }
}
async function callAPI(enpoint, method, data, _success, _error) {
  try {
    $.ajax({
      url: enpoint,
      type: method,
      contentType: "application/json",
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "Authorization",
          "Bearer " + token.getAccessToken()
        );
      },
      data: data,
      success: function (response) {
        // console.log(response);
        if (response.status == true) {
          _success(response);
        } else {
          _error(response);
        }
      },
      error: function (e) {
        _error(e);
        // if (e.responseJSON.status == false) {
        //   _error("??????????????????????????????????????????6");
        // } else {
        //   _error("??????????????????????????????????????????7");
        // }
      },
    });
  } catch (error) {
    _error("??????????????????????????????????????????8");
  }
}
function getInitial(_callback) {
  $.ajax({
    url: api_base_url + "/getAdminInfo",
    type: "POST",
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + token.getAccessToken());
    },
    data: {
      token: token.getUserToken(),
    },
    success: function (response) {
      console.log(response);

      // response.data = CryptoJSAesJson.decrypt(response.data, secret_key_aes);
      var profile = response.data;
      if (response.status == true) {
        // clearInitial();
        localStorage.setItem("profile", JSON.stringify(profile));
        setProfile();
      } else {
        alert("??????????????????????????????????????????");
        $("#logout").click();
        _error("??????????????????????????????????????????9");
      }
      _callback && _callback();
    },
    error: function (e) {
      alert("??????????????????????????????????????????");
      $("#logout").click();
      _error("??????????????????????????????????????????10");
    },
  });
}
function getNewId() {
  return Date.now() + getRandomInt(50);
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function sqlInsert(table, data, _callback) {
  var inserted_id = getNewId();
  var column = "";
  for (var i = 0; i < Object.keys(data).length; i++) {
    column += Object.keys(data)[i] + ",";
  }
  column = "ID," + column.slice(0, -1);

  var value = "";
  for (var i = 0; i < Object.keys(data).length; i++) {
    value += "'" + data[Object.keys(data)[i]] + "',";
  }
  value = inserted_id + "," + value.slice(0, -1);
  db.transaction(function (tx) {
    var insert_string =
      "INSERT INTO " + table + " (" + column + ") VALUES (" + value + ")";
    console.log(insert_string);
    tx.executeSql(insert_string);
  });
  _callback(inserted_id);
}
function queryByID(TABLE, ID, _callback) {
  var arr = [];
  // console.log("SELECT rowid,* FROM " + TABLE + " WHERE ID=" + parseInt(ID));
  db.transaction(function (tx) {
    tx.executeSql(
      "SELECT rowid,* FROM " + TABLE + " WHERE ID=" + parseInt(ID),
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;

        for (i = 0; i < len; i++) {
          // console.log(results.rows.item(i));
          _callback(results.rows.item(i));
        }
      },
      null
    );
  });
}
function queryByIDText(TABLE, ID, _callback) {
  var arr = [];
  // console.log(
  //   "SELECT rowid,* FROM " + TABLE + " WHERE ID='" + parseInt(ID) + "'"
  // );
  db.transaction(function (tx) {
    tx.executeSql(
      "SELECT rowid,* FROM " + TABLE + " WHERE ID='" + parseInt(ID) + "'",
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;

        for (i = 0; i < len; i++) {
          // console.log(results.rows.item(i));
          _callback(results.rows.item(i));
        }
      },
      null
    );
  });
}
function queryByELDER_ID(TABLE, ELDER_ID, _callback) {
  var arr = [];
  console.log(
    "SELECT rowid,* FROM " + TABLE + " WHERE ELDER_ID=" + parseInt(ELDER_ID)
  );
  db.transaction(function (tx) {
    tx.executeSql(
      "SELECT rowid,* FROM " +
        TABLE +
        " WHERE ELDER_ID='" +
        parseInt(ELDER_ID) +
        "'",
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;
        for (i = 0; i < len; i++) {
          arr.push(results.rows.item(i));
        }
        _callback(arr);
      },
      null
    );
  });
}
function queryGetDiseaseByELDER_ID(TABLE, ELDER_ID, _callback) {
  var arr = [];
  // console.log(
  //   "SELECT MAX(UPDATE_DATE),rowid,* FROM " +
  //     TABLE +
  //     ' WHERE VISIT1 = "1" AND ELDER_ID="' +
  //     parseInt(ELDER_ID) +
  //     '"'
  // );
  db.transaction(function (tx) {
    tx.executeSql(
      "SELECT MAX(UPDATE_DATE),rowid,* FROM " +
        TABLE +
        ' WHERE VISIT1 = "1" AND ELDER_ID="' +
        parseInt(ELDER_ID) +
        '"',
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;
        for (i = 0; i < len; i++) {
          arr.push(results.rows.item(i));
        }
        _callback(arr);
      },
      null
    );
  });
}
function queryKnowledgeHEADER(_callback) {
  var arr = [];
  // console.log(
  //   'SELECT rowid,* FROM VHV_MA_HEADER WHERE TYPE_ARTICLE = "2" AND DELETE_FLAG = "0"'
  // );
  db.transaction(function (tx) {
    tx.executeSql(
      'SELECT rowid,* FROM VHV_MA_HEADER WHERE TYPE_ARTICLE = "2" AND DELETE_FLAG = "0"',
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;

        for (i = 0; i < len; i++) {
          arr.push(results.rows.item(i));
        }
        _callback(arr);
      },
      null
    );
  });
}
function queryGetSHPHtelStaff(SHPH_ID, _callback) {
  var arr = [];
  console.log(
    'SELECT rowid,* FROM VHV_MA_SHPH WHERE ID="' + parseInt(SHPH_ID) + '"'
  );
  db.transaction(function (tx) {
    tx.executeSql(
      'SELECT rowid,* FROM VHV_MA_SHPH WHERE ID="' + parseInt(SHPH_ID) + '"',
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;
        for (i = 0; i < len; i++) {
          arr.push(results.rows.item(i));
        }
        _callback(arr);
      },
      null
    );
  });
}
function queryGetIdProvinceByVhv(_callback) {
  var arr = [];
  // console.log(
  //   'SELECT DISTINCT VHV_MA_SHPH.GIS_PROVINCE FROM VHV_TR_VHV LEFT JOIN VHV_MA_SHPH ON VHV_TR_VHV.SHPH_ID = VHV_MA_SHPH.ID WHERE VHV_TR_VHV.DELETE_FLAG = "0" AND VHV_MA_SHPH.DELETE_FLAG = "0"'
  // );
  db.transaction(function (tx) {
    tx.executeSql(
      'SELECT DISTINCT VHV_MA_SHPH.GIS_PROVINCE FROM VHV_TR_VHV LEFT JOIN VHV_MA_SHPH ON VHV_TR_VHV.SHPH_ID = VHV_MA_SHPH.ID WHERE VHV_TR_VHV.DELETE_FLAG = "0" AND VHV_MA_SHPH.DELETE_FLAG = "0"',
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;
        for (i = 0; i < len; i++) {
          arr.push(results.rows.item(i));
        }
        _callback(arr);
      },
      null
    );
  });
}
function queryGetOFFICEtelStaff(GIS_PROVINCE, GIS_DISTRICT, _callback) {
  var arr = [];
  console.log(
    'SELECT rowid,* FROM VHV_MA_OFFICE WHERE GIS_DISTRICT= "' +
      parseInt(GIS_DISTRICT) +
      '" AND GIS_PROVINCE = "' +
      parseInt(GIS_PROVINCE) +
      '"'
  );
  db.transaction(function (tx) {
    tx.executeSql(
      'SELECT rowid,* FROM VHV_MA_OFFICE WHERE GIS_DISTRICT= "' +
        parseInt(GIS_DISTRICT) +
        '" AND GIS_PROVINCE = "' +
        parseInt(GIS_PROVINCE) +
        '"',
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;
        for (i = 0; i < len; i++) {
          arr.push(results.rows.item(i));
        }
        _callback(arr);
      },
      null
    );
  });
}
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
function searchFunction(arr, column, item) {
  let nResult = [];
  for (let i = 0; i < arr.length; i++) {
    var str = arr[i][column].toLowerCase();
    if (str.includes(item.toLowerCase())) {
      nResult.push(arr[i]);
    }
  }
  return nResult;
}
function queryByRowID(TABLE, rowID, _callback) {
  var arr = [];
  console.log(
    "SELECT rowid,* FROM " + TABLE + " WHERE rowid=" + parseInt(rowID)
  );
  db.transaction(function (tx) {
    tx.executeSql(
      "SELECT rowid,* FROM " + TABLE + " WHERE rowid=" + parseInt(rowID),
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;

        for (i = 0; i < len; i++) {
          console.log(results.rows.item(i));
          _callback(results.rows.item(i));
        }
      },
      null
    );
  });
}
function sqlUpdate(TABLE, data, ID, _callback) {
  // console.log(TABLE);
  // console.log(data);
  // console.log(ID);
  var str = "";
  for (var i = 0; i < Object.keys(data).length; i++) {
    str += Object.keys(data)[i] + "='" + data[Object.keys(data)[i]] + "',";
  }
  str = str.slice(0, -1);

  let update_query = "UPDATE " + TABLE + " SET " + str + " WHERE ID=" + ID;
  console.log(update_query);
  db.transaction(function (tx) {
    tx.executeSql(update_query);
    _callback(ID);
  });
}
function sqlDelete(TABLE, ID, _callback) {
  let str = "DELETE FROM " + TABLE + " WHERE ID=" + ID;
  console.log(str);
  db.transaction(function (tx) {
    tx.executeSql(str);
    _callback(ID);
  });
}
function queryALL(TABLE, _callback) {
  var arr = [];
  db.transaction(function (tx) {
    tx.executeSql(
      "SELECT rowid,* FROM " + TABLE,
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;

        for (i = 0; i < len; i++) {
          arr.push(results.rows.item(i));
        }
        _callback(arr);
      },
      null
    );
  });
}
// function chkStatusEvaAll(ELDER_ID, _callback) {
//   var arr = [];
//   queryByID("VHV_TR_EVALUATE1", ELDER_ID, function (res) {
//     console.log(res);
//     // _callback(res);
//   });
// }
function listElderEvaluate(_callback) {
  var waitForEvaluate = [];
  var evaluated = [];
  db.transaction(function (tx) {
    tx.executeSql(
      `SELECT distinct elder.rowid, elder.* FROM VHV_TR_ELDER as elder WHERE elder.EVALUATE_STATUS = '0'`,
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;
        for (i = 0; i < len; i++) {
          console.log(results.rows.item(i));
          waitForEvaluate.push(results.rows.item(i));
        }
      },
      null
    );
    tx.executeSql(
      `SELECT distinct elder.rowid, elder.* FROM VHV_TR_ELDER as elder WHERE elder.EVALUATE_STATUS = '1'`,
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;
        for (i = 0; i < len; i++) {
          console.log(results.rows.item(i));
          evaluated.push(results.rows.item(i));
        }
        _callback(waitForEvaluate, evaluated);
      },
      null
    );
  });
}
// yyyy-mm-dd
function getAge(dateString, yearOnly = false) {
  if (dateString != null) {
    var now = new Date();
    var today = new Date(now.getYear(), now.getMonth(), now.getDate());

    var yearNow = now.getYear();
    var monthNow = now.getMonth();
    var dateNow = now.getDate();
    var dob = new Date(
      dateString.substring(0, 4),
      dateString.substring(5, 7) - 1,
      dateString.substring(8, 10)
    );

    var yearDob = dob.getYear();
    var monthDob = dob.getMonth();
    var dateDob = dob.getDate();
    var age = {};
    var ageString = "";
    var yearString = "";
    var monthString = "";
    var dayString = "";

    yearAge = yearNow - yearDob;

    if (monthNow >= monthDob) var monthAge = monthNow - monthDob;
    else {
      yearAge--;
      var monthAge = 12 + monthNow - monthDob;
    }

    if (dateNow >= dateDob) var dateAge = dateNow - dateDob;
    else {
      monthAge--;
      var dateAge = 31 + dateNow - dateDob;

      if (monthAge < 0) {
        monthAge = 11;
        yearAge--;
      }
    }

    age = {
      years: yearAge,
      months: monthAge,
      days: dateAge,
    };

    if (age.years > 1) yearString = " ??????";
    else yearString = " year";
    if (age.months > 1) monthString = " ???????????????";
    else monthString = " month";
    if (age.days > 1) dayString = " days";
    else dayString = " day";
    if (yearOnly && age.years > 0) {
      ageString = "???????????? " + age.years + yearString;
    } else if (age.years > 0 && age.months > 0)
      ageString =
        "???????????? " + age.years + yearString + ", " + age.months + monthString;
    else if (age.years == 0 && age.months == 0 && age.days > 0)
      ageString = "???????????? " + age.days + dayString;
    else if (age.years > 0 && age.months > 0 && age.days == 0)
      ageString =
        "???????????? " + age.years + yearString + ", " + age.months + monthString;
    else if (age.years == 0 && age.months > 0 && age.days > 0)
      ageString =
        "???????????? " + age.years + yearString + ", " + age.months + monthString;
    else if (age.years > 0 && age.months == 0 && age.days > 0)
      ageString =
        "???????????? " + age.years + yearString + ", " + age.months + monthString;
    else if (age.years == 0 && age.months > 0 && age.days == 0)
      ageString = "???????????? " + age.months + monthString;
    else ageString = "?????????????????????????????????????????????";
  } else ageString = "?????????????????????????????????????????????";
  return ageString;
}
function getMaxDateEva(ELDER_ID, _callback) {
  var arr = [];
  db.transaction(function (tx) {
    tx.executeSql(
      `SELECT MAX(UPDATE_DATE) AS MaxDate FROM
          (
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE1 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE2 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE3 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE4 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE5 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE6 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE7 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE8 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE9 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE10 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE11 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE12 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' UNION
            SELECT UPDATE_DATE FROM VHV_TR_EVALUATE13 WHERE ELDER_ID = '` +
        ELDER_ID +
        `' ) AS my_tab`,
      [],
      function (tx, results) {
        var len = results.rows.length,
          i;
        for (i = 0; i < len; i++) {
          arr.push(results.rows.item(i));
        }
        _callback(arr);
      },
      null
    );
  });
}
function getMonthThai(month_no) {
  var monthNamesThai = [
    "???.???.",
    "???.???.",
    "??????.???.",
    "??????.???.",
    "???.???.",
    "??????.???.",
    "???.???",
    "???.???.",
    "???.???.",
    "???.???.",
    "???.???.",
    "???.???.",
  ];
  return monthNamesThai[month_no];
}
function getMonthThaiFull(month_no) {
  var monthNamesThai = [
    "??????????????????",
    "??????????????????????????????",
    "??????????????????",
    "??????????????????",
    "?????????????????????",
    "????????????????????????",
    "?????????????????????",
    "?????????????????????",
    "?????????????????????",
    "??????????????????",
    "???????????????????????????",
    "?????????????????????",
  ];
  return monthNamesThai[month_no];
}
function renderElderCard(elderData, righticon = true) {
  console.log(elderData);
  var classhealth = "healthy";
  var healthText = "?????????????????????????????????";
  var classvisit = "wait-for-visit";
  var visitText = "?????????????????????????????????...";
  var classevalate = "wait-for-evaluate";
  var evalateText = "???????????????????????????...";

  if (elderData.HEALTH_STATUS == 3) {
    classhealth = "patient-in-bed";
    healthText = "????????????????????????";
  } else if (elderData.HEALTH_STATUS == 2) {
    classhealth = "walker";
    healthText = "????????????????????????";
  } else if (elderData.HEALTH_STATUS == 1) {
    classhealth = "healthy";
    healthText = "?????????????????????";
  }

  if (elderData.EVALUATE_STATUS == 1) {
    classevalate = "evaluated";
    evalateText = "?????????????????????????????????";
  } else if (elderData.EVALUATE_STATUS == 0) {
    classevalate = "wait-for-evaluate";
    evalateText = "???????????????????????????...";
  }

  if (elderData.VISIT_STATUS == 1) {
    classvisit = "visited";
    visitText = "???????????????????????????????????????";
  } else if (elderData.VISIT_STATUS == 0) {
    classvisit = "wait-for-visit";
    visitText = "?????????????????????????????????...";
  }
  var R_icon = "";
  if (righticon) {
    var R_icon = '<i class="right-icon fa fa-chevron-right"></i>';
  }

  return `<li ELDER_ID="${elderData.ID}">
  <div class="card-body">
    <img class="card-body-thumbnail" src="${elderData.ELDER_AVATAR}" />
    <div class="card-body-content">
      <h4 class="name">${elderData.ELDER_NAME}</h4>
      <h5 class="age">${getAge(elderData.ELDER_BIRTHDATE)}</h5>
      <p class="address"> ?????????????????????????????? ${elderData.ELDER_HOUSE_NO}</p>
    </div>
    ${R_icon}
  </div>
  <div class="card-footer">
    <span class="status ${classhealth}"><p>${healthText}</p> </span>
    <span class="status ${classevalate}"><p>${evalateText}</p></span>
    <span class="status ${classvisit}"><p>${visitText}</p></span>
  </div>
</li>`;
}
function getCurrentDate() {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(
    date.getDate(),
    2
  )} ${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(
    date.getSeconds(),
    2
  )}`;
}
function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}
function clearInitial() {
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_ELDER");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_MA_EVALUATE");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_MA_GIS_DISTRICT");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_MA_GIS_PROVINCE");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_MA_GIS_TUMBOL");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_MA_HEADER");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_MA_JOB ");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_MA_OFFICE ");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_MA_OFFICETYPE");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_MA_SHPH");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_MA_SHPH_MOO ");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_TR_CONTENT ");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM  VHV_TR_CONTENTLINK ");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EMERGENCY ");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE1");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE2");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE3");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE4");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE5");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE6");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE7 ");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE8");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE9");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE10");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE11 ");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE12 ");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_EVALUATE13 ");
  });

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_READCONTENT");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_SOLVE");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_VHV ");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_VHV_ELDER");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_TR_VISIT");
  });
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM VHV_MA_EMCTYPE");
  });
}
function dateStringFormat(date) {
  var day = date.substring(8, 10);

  var month = parseInt(date.substring(5, 7)) - 1;
  console.log(month);
  var year = date.substring(0, 4);
  var time = date.substring(11, 16);
  var dateString =
    " " +
    day +
    " " +
    getMonthThai(month) +
    " " +
    (parseInt(year) + 543).toString().substring(2, 4) +
    " ???????????? " +
    time +
    " ???.";
  return dateString;
}
function dateFullStringFormat(date) {
  var day = date.substring(8, 10);
  var month = parseInt(date.substring(5, 7)) - 1;
  var year = date.substring(0, 4);
  var time = date.substring(11, 16);
  var dateString =
    " " +
    day +
    " " +
    getMonthThaiFull(month) +
    " " +
    (parseInt(year) + 543).toString();
  return dateString;
}
function renderElderModal(item, modalId, showEva, showVisit) {
  $("#evaluate_recommend,#visit_recommend").hide();
  $(
    "#" + modalId + " .status-card.evaluate,#" + modalId + " .status-card.visit"
  ).html("");
  var maxdate = " ??????????????????????????????????????????";
  getMaxDateEva(item.ID, function (res) {
    if (res[0]["MaxDate"] != null) {
      var date = res[0]["MaxDate"];
      maxdate = dateStringFormat(date);
    }
    $("#" + modalId + " .status-card").attr("ELDER_ID", item.ID);
    $("#" + modalId + " .thumbnail").attr("src", item.ELDER_AVATAR);
    $("#" + modalId + " .name").text(item.ELDER_NAME);
    $("#" + modalId + " .age").text(getAge(item.ELDER_BIRTHDATE));
    $("#" + modalId + " .distant").hide();
    if (showEva == true) {
      $("#" + modalId + " .status-card.evaluate").html(`
              <div class="status-card-header wait-evaluate">
              <p><b>?????????????????????????????????????????????</b> : **???????????????????????????...</p>
            </div>
            <div class="status-card-body ready-for-evaluate">
              <div class="status-card-body-content">
                <h3>????????????????????????????????????</h3>
                <p>
                  <i class="fa fa-clock-o" aria-hidden="true"></i>
                  ??????????????????????????????????????????
                </p>
              </div>
              <div class="status-card-body-btn-evaluate">
                <i class="fa fa-chevron-right"></i>
              </div>
            </div>
         `);

      if (item.EVALUATE_STATUS == 1) {
        $("#" + modalId + " .status-card-header").removeClass(
          "wait-for-evaluate"
        );
        $("#" + modalId + " .status-card-header").addClass("evaluated");
        $("#" + modalId + " .status-card-header").html(
          "<p><b>?????????????????????????????????????????????</b> : ?????????????????????????????????</p>"
        );
        $("#" + modalId + " .status-card-body-content").html(`
                <h3>?????????????????????????????????</h3>
                <p style="font-size:11px">
                  <i class="fa fa-clock-o" aria-hidden="true"></i>${maxdate}
                </p>`);
      } else if (item.EVALUATE_STATUS == 0) {
        $("#" + modalId + " .status-card-header").removeClass("evaluated");
        $("#" + modalId + " .status-card-header").addClass("wait-for-evaluate");
        $("#" + modalId + " .status-card-header").html(
          "<p><b>?????????????????????????????????????????????</b> : ???????????????????????????...</p>"
        );
        $("#" + modalId + " .status-card-body-content").html(`
                <h3>????????????????????????????????????</h3>
                <p style="font-size:11px">
                  <i class="fa fa-clock-o" aria-hidden="true"></i>
                  ??????????????????????????????????????????
                </p>`);
      }
    }
    if (showVisit == true) {
      queryALL("VHV_TR_VISIT", function (vhv_tr_visit) {
        let visit = vhv_tr_visit.filter((row) => row.ELDER_ID == item.ID);
        let visitCount = visit.length;

        $("#" + modalId + " .status-card.visit").html(`
        <div class="status-card-header">
          <p><b>??????????????????????????????????????????</b> : ??????????????????????????????????????????...</p>
        </div>
        <div class="status-card-body ready-for-visit">
          <div class="status-card-body-content">
            <h3>??????????????????????????????????????????</h3>
            <p>
              <i class="fa fa-clock-o" aria-hidden="true"></i>
              ??????????????????????????????????????????
            </p>
          </div>
          <div class="status-card-body-btn">
            <i class="fa fa-chevron-right"></i>
          </div>
        </div>
      `);
        if (item.EVALUATE_STATUS == 1) {
          console.log(item.VISIT_STATUS);
          $("#" + modalId + " .status-card.visit").attr("canvisit", true);
          if (item.VISIT_STATUS == 1) {
            let lastVisit = visit[visit.length - 1];
            $(
              "#" + modalId + " .status-card.visit .status-card-header"
            ).addClass("visited");
            $("#" + modalId + " .status-card.visit .status-card-header").html(
              `<p><b>??????????????????????????????????????????</b> : ??????????????????????????????????????? ${visitCount} ???????????????</p>`
            );
            $(
              "#" +
                modalId +
                " .status-card.visit .status-card-body .status-card-body-content"
            ).html(`
            <h3>???????????????????????????????????????</h3>
            <p style="font-size:11px">
              <i class="fa fa-clock-o" aria-hidden="true"></i>
             ${dateStringFormat(lastVisit.VISIT_DATE)}
            </p>`);
          } else {
          }
        } else {
          $("#" + modalId + " .status-card.visit").attr("canvisit", false);
          $("#" + modalId + " .status-card.visit .status-card-header").html(
            "<p><b>??????????????????????????????????????????</b> : ???????????????????????????????????????????????????????????????</p>"
          );
          $(
            "#" + modalId + " .status-card.visit .status-card-body"
          ).removeClass("ready-for-visit");
          $(
            "#" +
              modalId +
              " .status-card.visit .status-card-body .status-card-body-content"
          ).html(`
          <h3>??????????????????????????????????????????</h3>
          <p>
            <i class="fa fa-clock-o" aria-hidden="true"></i>
            ??????????????????????????????????????????
          </p>`);
          $("#" + modalId + " .status-card-body-btn").remove();
        }
      });
    }

    showModal(modalId);
  });
}
function validateForm(array) {
  let validate = true;
  console.log(array);
  for (let index = 0; index < array.length; index++) {
    const value = array[index];
    if (value == "" || value == undefined || value == null) {
      validate = false;
      break;
    }
  }
  return validate;
}
const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};
function initialSearchHeaderFunc() {
  $(".search_header input").removeClass("active");
  $(".search_header input").prop("disabled", true);
  $(".search_header").removeClass("active");
  $("#qtyitemsearch").hide();
  $(".search_header input").val("");
}
function modalDialog(title, sub_title, mode) {
  $("#modal-dialog .title").text(title);
  $("#modal-dialog .sub-title").text(sub_title);
  if (mode == "alert") {
    $("#modal-dialog .title").css("color", "#f26e4f");
    // $('#modal-dialog img').attr('src','')
  } else {
    $("#modal-dialog .title").css("color", "#1bc3a2");
    // $('#modal-dialog img').attr('src','img/evaluate_success.png')
  }
  showModal("modal-dialog");
}
function getDistanceMatrix(origin, destination, _success, _error) {
  try {
    var distanceService = new google.maps.DistanceMatrixService();
    distanceService.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        durationInTraffic: true,
        avoidHighways: false,
        avoidTolls: false,
      },
      function (response, status) {
        if (status !== google.maps.DistanceMatrixStatus.OK) {
          _error(response);
        } else {
          _success(response);
        }
      }
    );
  } catch (error) {
    _error("??????????????????????????????????????????8");
  }
}
