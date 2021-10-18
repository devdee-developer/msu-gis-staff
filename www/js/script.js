let map, infoWindow;
var swiper;
var swiper2;
var loading = new Loading();
var topMenu = new TopMenu();
var token = new Token();
var swiper_timer = setInterval(function () {}, 3000);
var swiper_timer2 = setInterval(function () {}, 3000);
var news_data_list = [];
var CurrentPosUrgentNoti;
$(function () {
  FastClick.attach(document.body);
  //  window.pushNotification.registration(
  //     (token) => {
  //       console.log(token);
  //     },
  //     (error) => {
  //       console.error(error);
  //     }
  //   );
  
  $(".header_notification").hide();
  $(".profile_header_wrapper img").remove();
  console.log(token.getUserToken())
  if (!token.getUserToken()) {
    changePage("splash_page", function () {});
  } else {
    changePage("home_page", function () {
      if(localStorage.getItem("profile")){
        if (!token.getDeviceToken()) {
          cordova.plugins.firebase.messaging.getToken().then(function (token) {
            let postData = {
              noti_token: token,
              token: token.getUserToken(),
            };
            callAPI(
              `${api_base_url}/updateNotiToken`,
              "POST",
              JSON.stringify(postData),
              (res) => {
                console.log(`device token success`);
                localStorage.setItem("noti_token", token);
              },
              (err) => {
                console.log(` error `);
              }
            );
          });
        }
        getInitial(function(){
          setProfile();
        })
       
        calHomeButtonPosition();
      
        loading.show();
        initSlideHomePage();
      }else{
        getInitial();
      }
     
    
    });
  }
  $(".btn_splash").on("click", function () {
    changePage("login_page", function () {
      var _h = $(".header_login").height();
      $(".form_login").css("top", _h + "px");
    });
  });
  $(".main_home_menu_item_wrapper .main_home_menu_item")
  .eq(0)
  .on("click", function () {
    $('#home_page .footer_item.menu_news_page').click()
  });
  $(".main_home_menu_item_wrapper .main_home_menu_item")
  .eq(1)
  .on("click", function () {
    $('#map_page .footer_item.menu_map_page').click()
  });
  $(".main_home_menu_item_wrapper .main_home_menu_item")
    .eq(2)
    .on("click", function () {
      $('#home_page .footer_item.menu_urgent_page').click()
    });
  $(".btn_submit_login").on("click", function () {
    let username = $("#username").val();
    let password = $("#password").val();
    loading.show();
    login(
      username,
      password,
      0,
      0,
      0,
      function (res) {
        loading.hide();
        changePage("home_page", function () {
          calHomeButtonPosition();
          loading.show();
          getInitial(function () {
            initSlideHomePage();
          });
        });
      },
      function (err) {
        loading.hide();
        alert(err);
      }
    );
  });
  // $(".btn_submit_login").on("click", function () {
  //   let username = $("#username").val();
  //   let password = $("#password").val();
  //   loading.show();
  //   document.addEventListener("deviceready", onDeviceReady, false);
  //   function onDeviceReady() {
  //     navigator.geolocation.getCurrentPosition(onSuccess, onError, {
  //       enableHighAccuracy: true,
  //     });
  //   }
  //   function onSuccess(pos) {
  //     CurrentPosUrgentNoti = pos;
  //     cordova.plugins.firebase.messaging.getToken().then(function (token) {
  //       console.log("Got device token: ", token);

  //       login(
  //         username,
  //         password,
  //         CurrentPosUrgentNoti.coords.latitude,
  //         CurrentPosUrgentNoti.coords.longitude,
  //         token,
  //         function (res) {
  //           loading.hide();
  //           changePage("home_page", function () {
  //             calHomeButtonPosition();
  //             loading.show();
  //             getInitial(function () {
  //               initSlideHomePage();
  //             });
  //           });
  //         },
  //         function (err) {
  //           loading.hide();
  //           alert(err);
  //         }
  //       );
  //     });
  //   }
  //   function onError(error) {
  //     login(
  //       username,
  //       password,
  //       0,
  //       0,
  //       0,
  //       function (res) {
  //         loading.hide();
  //         changePage("home_page", function () {
  //           calHomeButtonPosition();
  //           loading.show();
  //           getInitial(function () {
  //             initSlideHomePage();
  //           });
  //         });
  //       },
  //       function (err) {
  //         loading.hide();
  //         alert(err);
  //       }
  //     );
  //   }
  // });

  $(".menu_home_page").on("click", function () {
    changePage("home_page", function () {
      calHomeButtonPosition();
      // loading.show();
      // swiper.destroy();
      // initSlideHomePage();
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
  });
  $(".menu_contact_page").on("click", function () {
    changePage("contact_page", function () {
      loading.show();
      setTimeout(function () {
        loading.hide();
      }, 500);
    });
  });
  // $(".menu_map_page").on("click", function () {
  //   changePage("map_page", function () {
  //     loading.show();
  //     setTimeout(function () {
  //       loading.hide();
  //     }, 500);
  //   });
  // });
  $(".menu_news_page").on("click", function () {
    changePage("news_page", function () {
      $("#news_page .back_header_btn").unbind();
      $('#news_page .back_header_btn').on('click',function(){
        $('#home_page .footer_item.menu_home_page').click()
    })
      $(".content").animate(
        {
          scrollTop: $(".content").offset().top,
        },
        0
      );
      loading.show();
      initSlideNewsPage();
    });
  });

  $(".profile_header_wrapper").on("click", function () {
    topMenu.show();
  });
  $(".top_menu_wrapper,.close_top_menu").on("click", function () {
    topMenu.hide();
  });
  $(".top_menu_item_wrapper").on("click", function (event) {
    event.preventDefault();
    return false;
  });
  $("#logout").on("click", function () {
    $(".close_top_menu").click();
    // clearInterval(syncDataInterval)
    localStorage.clear();
    loading.show();
    setTimeout(function () {
      loading.hide();
      window.location = "";
    }, 500);
  });
  $(window).resize(function () {
    // initSlideHomePage();
    // calHomeButtonPosition();
  });
  $(".modal-dismiss").on("click", function () {
    $(".modal").hide();
    $("body").removeClass("modal-open");
  });
});

// document.addEventListener("deviceready", onDeviceReady, false);
// function onDeviceReady() {}

// function initMap() {
//   map = new google.maps.Map(document.getElementById("map"), {
//     center: new google.maps.LatLng(-33.91722, 151.23064),
//     zoom: 16,
//     disableDefaultUI: true,
//     mapTypeControl: true,
//     mapTypeControlOptions: {
//       position: google.maps.ControlPosition.LEFT_CENTER,
//     },
//   });

//   const icons = {
//     parking: {
//       icon: "img/pin_marker.png",
//     },
//     library: {
//       icon: "img/pin_marker.png",
//     },
//     info: {
//       icon: "img/pin_marker.png",
//     },
//   };
//   const features = [
//     {
//       position: new google.maps.LatLng(-33.91721, 151.2263),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.91539, 151.2282),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.91747, 151.22912),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.9191, 151.22907),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.91725, 151.23011),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.91872, 151.23089),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.91784, 151.23094),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.91682, 151.23149),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.9179, 151.23463),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.91666, 151.23468),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.916988, 151.23364),
//       type: "info",
//     },
//     {
//       position: new google.maps.LatLng(-33.91662347903106, 151.22879464019775),
//       type: "parking",
//     },
//     {
//       position: new google.maps.LatLng(-33.916365282092855, 151.22937399734496),
//       type: "parking",
//     },
//     {
//       position: new google.maps.LatLng(-33.91665018901448, 151.2282474695587),
//       type: "parking",
//     },
//     {
//       position: new google.maps.LatLng(-33.919543720969806, 151.23112279762267),
//       type: "parking",
//     },
//     {
//       position: new google.maps.LatLng(-33.91608037421864, 151.23288232673644),
//       type: "parking",
//     },
//     {
//       position: new google.maps.LatLng(-33.91851096391805, 151.2344058214569),
//       type: "parking",
//     },
//     {
//       position: new google.maps.LatLng(-33.91818154739766, 151.2346203981781),
//       type: "parking",
//     },
//     {
//       position: new google.maps.LatLng(-33.91727341958453, 151.23348314155578),
//       type: "library",
//     },
//   ];

//   // Create markers.
//   for (let i = 0; i < features.length; i++) {
//     const marker = new google.maps.Marker({
//       position: features[i].position,
//       icon: icons[features[i].type].icon,
//       map: map,
//     });
//   }
// }
