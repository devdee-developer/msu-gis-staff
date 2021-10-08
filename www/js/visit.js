$(function () {
  //contact list
 let visit_elder_id
 let visit_from_page
  $(".main_home_menu_item_wrapper img")
    .eq(2)
    .on("click", function () {
      loading.show();
      setTimeout(function () {
        changePage("visit_page", function () {
          initialVisitPage();
        });
      }, 500);
    });
    function renderElderListVisit(_callback){
      queryALL("VHV_TR_ELDER", function (elderList) {
        console.log(elderList);
        let waitingList = elderList.filter((row) => row.VISIT_STATUS == 0);
        let visitedList = elderList.filter((row) => row.VISIT_STATUS == 1);
        $("#visit_page .waiting_list").html("");
        $("#visit_page .visited_list").html("");
        $("#visit_page .sort-bar h4 span").html(`${elderList.length} คน`);
        $("#visit_page .waiting_list_count").text(
          `...กำลังรอยู่ ${waitingList.length} คน`
        );
        $("#visit_page .visited_list_count").text(
          `จำนวน ${visitedList.length} คน`
        );
        $.each(waitingList, function (index, row) {
          $("#visit_page .waiting_list").append(renderElderCard(row));
        });
        $.each(visitedList, function (index, row) {
          $("#visit_page .visited_list").append(renderElderCard(row));
        });
        loading.hide();
        _callback(waitingList,visitedList)
      });
    }
  function initialVisitPage() {
    renderElderListVisit(function(waitingList,visitedList){
      // setTimeout(function () {
      //   let waitingListAndEvaluated = waitingList.filter(
      //     (row) => row.EVALUATE_STATUS == 1
      //   );
      //   if (waitingListAndEvaluated.length > 0) {
      //     renderElderModal(
      //       waitingListAndEvaluated[0],
      //       "modal-visit-detail",
      //       false,
      //       true
      //     );
      //     $("#visit_recommend").show();
      //   }
      // }, 500);
      queryALL("VHV_MA_GIS_PROVINCE", function (res) {
        if(res){
          $("#visit_page .content .collapse-filter #visitSearchProvince").val(
            "จังหวัด " + res[0]["GIS_PROVINCENAME"]
          );
        }else{
          $("#visit_page .content .collapse-filter #visitSearchProvince").val(
            "จังหวัด "
          );
        }
        
      });
      
      queryALL("VHV_MA_GIS_TUMBOL", function (res) {
        if(res){
          $("#visit_page .content .collapse-filter #visitSearchTumbol").val(
            "ตำบล " + res[0]["GIS_TUMBOLNAME"]
          );
        }else{
          $("#visit_page .content .collapse-filter #visitSearchTumbol").val(
            "ตำบล "
          );
        }
       
      });
      queryALL("VHV_MA_SHPH_MOO", function (res) {
        if(res){
          $("#visit_page .content .collapse-filter #visitSearchMoo").val(
            "หมู่ที่ " + res[0]["SHPH_MOO"]
          );
        }else{
          $("#visit_page .content .collapse-filter #visitSearchMoo").val(
            "หมู่ที่ "
          );
        }
        
      });
    })
   
  }
  $("#visit_page .collapse-filter .collapse-filter-header").click(function () {
    $header = $(this);
    $content = $header.next();
    $(".toggle", this).toggleClass("fa-chevron-up fa-chevron-down");
    $content.slideToggle(200, function () {});
  });
  $("#visit_page .btn-sort").on("click", function () {
    showModal("modal-sort-visit");
  });

  $("#visit_page .contact_items").on("click", "li", function () {
    queryByID("VHV_TR_ELDER", $(this).attr("ELDER_ID"), function (res) {
      renderElderModal(res, "modal-visit-detail", false, true);
    });
  });
  //visit detail
  $(".status-card.visit").on("click", function () {
  
    if ($(this).attr("canvisit") == "true") {
      visit_from_page = $(this).parent().parent().parent().attr('id')
      visit_elder_id = $(`#${$(this).parents('.modal').attr('id')} .status-card`).attr("ELDER_ID")
      loading.show();
      reloadVisitList();
      setTimeout(function () {
        loading.hide();
        changePage("visit_detail_page", function () {
          readerAfterSaveVisit();
        });
      }, 500);
    }
  });
  function readerAfterSaveVisit() {
    $("#visit_detail_page .content .visit_status_bar span").text(
      " " + $("#visit_detail_page ul li span").eq(0).text()
    );
    queryByID(
      "VHV_TR_ELDER",
      visit_elder_id,
      function (res) {
        if (res.HEALTH_STATUS == 1) {
          $("#visit_detail_page .content .visit_status_bar img").attr(
            "src",
            "img/health_2_icon.png"
          );
          $("#visit_detail_page .content .visit_status_bar span").text(
            "แข็งแรง"
          );
        } else if (res.HEALTH_STATUS == 2) {
          $("#visit_detail_page .content .visit_status_bar img").attr(
            "src",
            "img/health_3_icon.png"
          );
          $("#visit_detail_page .content .visit_status_bar span").text(
            "พยุงเดิน"
          );
        } else if (res.HEALTH_STATUS == 3) {
          $("#visit_detail_page .content .visit_status_bar img").attr(
            "src",
            "img/health_1_icon.png"
          );
          $("#visit_detail_page .content .visit_status_bar span").text(
            "ติดเตียง"
          );
        } else {
          $("#visit_detail_page .content .visit_status_bar span").text(
            "ไม่มีข้อมูล"
          );
        }
      }
    );
  }
  function reloadVisitList() {
    
    let elder_id = visit_elder_id;
   console.log(visit_elder_id)
    let visitData = [];
    $("#visit_detail_page .content").find(".list_item_group").remove();
    queryALL("VHV_TR_ELDER", function (ELDER) {
      $("#visit_detail_page .contact_items").html(
        renderElderCard(
          ELDER.find((item) => item.ID == elder_id),
          false
        )
      );
    });
    queryALL("VHV_TR_VISIT", function (vhv_tr_visit) {
      let visitList = vhv_tr_visit
        .filter((row) => row.ELDER_ID == elder_id)
        .map((row, index) => {
          // row.VISIT_NO = index + 1;
          row.VISIT_NO = parseInt(row.VISIT_NO)
          row.MONTH_AND_YEAR = row.VISIT_DATE.substring(0, 7);
          return row;
        })
        .sort((a, b) =>
          a.rowid > b.rowid ? -1 : b.rowid > a.rowid ? 1 : 0
        );
      let visitListByMonth = groupBy(visitList, "MONTH_AND_YEAR");
      let i = 0;
      for (const yearMonthData in visitListByMonth) {
        
        console.log(`${yearMonthData}:`, visitListByMonth[yearMonthData]);
        $("#visit_detail_page .content").append(
          `<div class="list_item_group ${yearMonthData}"><div>`
        );
        $(`#visit_detail_page .content .list_item_group.${yearMonthData}`)
          .append(`<div class="history_month_label">
        <svg width="15.177" height="20.546" viewBox="0 0 15.177 20.546"><defs><style>.a { fill: #3b3d48;}</style></defs><g transform="translate(-1267.095 -933.068)"><g transform="translate(1267.095 933.068)"><path class="a" d="M1281.239,945.79h-3.564a1.648,1.648,0,0,1,0,2.065h2.532v13.112h-11.047V947.855h2.222a1.648,1.648,0,0,1,0-2.065h-3.254a1.032,1.032,0,0,0-1.032,1.033V962a1.032,1.032,0,0,0,1.032,1.032h13.112a1.032,1.032,0,0,0,1.033-1.032V946.823A1.032,1.032,0,0,0,1281.239,945.79Z" transform="translate(-1267.095 -942.486)"></path><path class="a" d="M1284.627,940.089h-3.717a2.684,2.684,0,0,1-.62-5.3V934.1a1.032,1.032,0,0,1,1.032-1.033h3.3a1.033,1.033,0,0,1,1.032,1.033v.826a2.685,2.685,0,0,1-1.032,5.162Zm-3.717-3.3a.619.619,0,1,0,0,1.239h3.717a.619.619,0,0,0,0-1.239,1.032,1.032,0,0,1-1.033-1.032v-.62h-1.239v.62a1.032,1.032,0,0,1-1.032,1.032Z" transform="translate(-1275.335 -933.068)"></path></g><g transform="translate(1270.708 944.633)"><g transform="translate(0 3.376)"><path class="a" d="M1287.823,992.677h-5.782a1.039,1.039,0,0,1,0-2.078h5.782a1.039,1.039,0,0,1,0,2.078Z" transform="translate(-1281.009 -990.599)"></path></g><g transform="translate(0 0)"><path class="a" d="M1287.823,979.677h-5.782a1.039,1.039,0,0,1,0-2.078h5.782a1.039,1.039,0,0,1,0,2.078Z" transform="translate(-1281.009 -977.599)"></path></g></g></g></svg>
        &nbsp; ประวัติ เดือน${getMonthThaiFull(
          parseInt(yearMonthData.substring(5, 7)) - 1
        )}
      </div>`);
        $.each(visitListByMonth[yearMonthData], function (index, entry) {
          $(
            `#visit_detail_page .content .list_item_group.${yearMonthData}`
          ).append(renderVisitCard(entry, i == 0 ? true : false));
          i++;
          console.log(entry);
        });
        initialEditVisitForm();
      }
    });
    function groupBy(objectArray, property) {
      return objectArray.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {});
    }
  }
  function renderVisitCard(visit, current = false) {
    card = `<div class="visit_card ${current ? "current" : ""}" visit_rowid="${
      visit.rowid
    }"">
    <div class="card_header">
      <p><b>สถานะออกเยี่ยม :</b> ครั้งที่ ${visit.VISIT_NO} (${getMonthThaiFull(
      parseInt(visit.VISIT_DATE.substring(5, 7)) - 1
    )} ${parseInt(visit.VISIT_DATE.substring(0, 4)) + 543})</p>
    </div>
    <div class="card_body">
      <div class="card_body_left">
        <div class="circle1">
          <div class="circle2">
            <div class="circle3">
              <i class="fa fa-check" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="card_body_center">
        <p>ออกเยี่ยมสำเร็จ ${current ? "(ล่าสุด)" : ""}</p>
        <p>
          <i class="fa fa-clock-o" aria-hidden="true"></i> อัพเดทเมื่อ:
          ${dateStringFormat(visit.VISIT_DATE)}${visit.GUID!=""&&visit.GUID!= null?' <i class="fa fa-check" aria-hidden="true"></i>':""}</p>
          ${
            visit.SOLVE0 == 1
              ? `<div class="alert_message">
          <svg width="9" height="14" viewBox="0 0 15.177 20.546">
            <defs></defs>
            <g transform="translate(-1267.095 -933.068)">
              <g transform="translate(1267.095 933.068)">
                <path class="fill" d="M1281.239,945.79h-3.564a1.648,1.648,0,0,1,0,2.065h2.532v13.112h-11.047V947.855h2.222a1.648,1.648,0,0,1,0-2.065h-3.254a1.032,1.032,0,0,0-1.032,1.033V962a1.032,1.032,0,0,0,1.032,1.032h13.112a1.032,1.032,0,0,0,1.033-1.032V946.823A1.032,1.032,0,0,0,1281.239,945.79Z" transform="translate(-1267.095 -942.486)"></path>
                <path class="fill" d="M1284.627,940.089h-3.717a2.684,2.684,0,0,1-.62-5.3V934.1a1.032,1.032,0,0,1,1.032-1.033h3.3a1.033,1.033,0,0,1,1.032,1.033v.826a2.685,2.685,0,0,1-1.032,5.162Zm-3.717-3.3a.619.619,0,1,0,0,1.239h3.717a.619.619,0,0,0,0-1.239,1.032,1.032,0,0,1-1.033-1.032v-.62h-1.239v.62a1.032,1.032,0,0,1-1.032,1.032Z" transform="translate(-1275.335 -933.068)"></path>
              </g>
              <g transform="translate(1270.708 944.633)">
                <g transform="translate(0 3.376)">
                  <path class="fill" d="M1287.823,992.677h-5.782a1.039,1.039,0,0,1,0-2.078h5.782a1.039,1.039,0,0,1,0,2.078Z" transform="translate(-1281.009 -990.599)"></path>
                </g>
                <g transform="translate(0 0)">
                  <path class="fill" d="M1287.823,979.677h-5.782a1.039,1.039,0,0,1,0-2.078h5.782a1.039,1.039,0,0,1,0,2.078Z" transform="translate(-1281.009 -977.599)"></path>
                </g>
              </g>
            </g>
          </svg>
          มีปัญหาที่ต้องการแก้ไข
        </div>`
              : ""
          }
        
      </div>
      <div class="card_body_right">
        <div class="status-card-body-btn">
          <i class="fa fa-chevron-right"></i>
        </div>
      </div>
    </div>
  </div>`;
    return card;
  }
  function initialEditVisitForm() {
    $("#visit_detail_page .visit_card").on("click", function () {
      let visit_rowid = $(this).attr("visit_rowid");
      initialVisitFormPage(true);
      queryByRowID("VHV_TR_VISIT", visit_rowid, function (data) {
        $(
          `#visit_form_page input[type="radio"][name="VISIT1"][value="${data.VISIT1}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT1"][value="${data.VISIT1}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(`#visit_form_page input#VISIT1_DESC`).val(data.VISIT1_DESC);
        $(
          `#visit_form_page input[type="radio"][name="VISIT2A"][value="${data.VISIT2A}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT2A"][value="${data.VISIT2A}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(
          `#visit_form_page input[type="radio"][name="VISIT2B"][value="${data.VISIT2B}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT2B"][value="${data.VISIT2B}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(`#visit_form_page input#VISIT2B_NAME1`).val(data.VISIT2B_NAME1);
        $(`#visit_form_page input#VISIT2B_TEL1`).val(data.VISIT2B_TEL1);
        $(`#visit_form_page input#VISIT2B_NAME2`).val(data.VISIT2B_NAME2);
        $(`#visit_form_page input#VISIT2B_TEL2`).val(data.VISIT2B_TEL2);
        $(
          `#visit_form_page input[type="radio"][name="VISIT2C"][value="${data.VISIT2C}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT2C"][value="${data.VISIT2C}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(
          `#visit_form_page input[type="radio"][name="VISIT2D"][value="${data.VISIT2D}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT2D"][value="${data.VISIT2D}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(`#visit_form_page input#VISIT3A_WEIGHT`).val(data.VISIT3A_WEIGHT);
        $(`#visit_form_page input#VISIT3A_HEIGHT`).val(data.VISIT3A_HEIGHT);
        $(`#visit_form_page input#VISIT3A_SBP`).val(data.VISIT3A_SBP);
        $(`#visit_form_page input#VISIT3A_DBP`).val(data.VISIT3A_DBP);
        $(`#visit_form_page input#VISIT3A_PULSE`).val(data.VISIT3A_PULSE);
        $(
          `#visit_form_page input[type="radio"][name="VISIT3B"][value="${data.VISIT3B}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT3B"][value="${data.VISIT3B}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(
          `#visit_form_page input[type="radio"][name="VISIT3C"][value="${data.VISIT3C}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT3C"][value="${data.VISIT3C}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(`#visit_form_page input[type="checkbox"]#VISIT3DA`).prop(
          "checked",
          data.VISIT3DA == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT3DB`).prop(
          "checked",
          data.VISIT3DB == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT3DC`).prop(
          "checked",
          data.VISIT3DC == 1 ? true : false
        );
        $(`#visit_form_page input#VISIT3DC_DESC`).val(data.VISIT3DC_DESC);
        $(`#visit_form_page input[type="checkbox"]#VISIT3EA`).prop(
          "checked",
          data.VISIT3EA == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT3EB`).prop(
          "checked",
          data.VISIT3EB == 1 ? true : false
        );
        $(
          `#visit_form_page input[type="radio"][name="VISIT3F"][value="${data.VISIT3F}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT3F"][value="${data.VISIT3F}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(
          `#visit_form_page input[type="radio"][name="VISIT4A"][value="${data.VISIT4A}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT4A"][value="${data.VISIT4A}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(
          `#visit_form_page input[type="radio"][name="VISIT4B"][value="${data.VISIT4B}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT4B"][value="${data.VISIT4B}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(
          `#visit_form_page input[type="radio"][name="VISIT4C"][value="${data.VISIT4C}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT4C"][value="${data.VISIT4C}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(`#visit_form_page input[type="checkbox"]#VISIT4DA`).prop(
          "checked",
          data.VISIT4DA == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT4DB`).prop(
          "checked",
          data.VISIT4D_DESC != "null" && data.VISIT4D_DESC ? true : false
        );
        $(`#visit_form_page input#VISIT4D_DESC`).val(data.VISIT4D_DESC);
        $(
          `#visit_form_page input[type="radio"][name="VISIT4EA"][value="${data.VISIT4EA}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="VISIT4EA"][value="${data.VISIT4EA}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        $(`#visit_form_page input#VISIT4E_DESC`).val(data.VISIT4D_DESC);
        $(`#visit_form_page input[type="checkbox"]#VISIT5A1`).prop(
          "checked",
          data.VISIT5A1 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5A2`).prop(
          "checked",
          data.VISIT5A2 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5A3`).prop(
          "checked",
          data.VISIT5A3 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5A4`).prop(
          "checked",
          data.VISIT5A4 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5A5`).prop(
          "checked",
          data.VISIT5A5 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5B1`).prop(
          "checked",
          data.VISIT5B1 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5B2`).prop(
          "checked",
          data.VISIT5B2 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5B3`).prop(
          "checked",
          data.VISIT5B3 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5B4`).prop(
          "checked",
          data.VISIT5B4 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5C1`).prop(
          "checked",
          data.VISIT5C1 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5C2`).prop(
          "checked",
          data.VISIT5C2 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5C3`).prop(
          "checked",
          data.VISIT5C3 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"]#VISIT5C4`).prop(
          "checked",
          data.VISIT5C4 == 1 ? true : false
        );
        $(`#visit_form_page input[type="checkbox"][name="VISIT6"]`).prop(
          "checked",
          true
        );
        $(
          `#visit_form_page input[type="radio"][name="SOLVE0"][value="${data.SOLVE0}"]`
        ).prop("checked", true);
        $(
          `#visit_form_page input[type="radio"][name="SOLVE0"][value="${data.SOLVE0}"]`
        )
          .siblings(".toggle_input_group")
          .show();
        queryALL("VHV_TR_SOLVE", function (solve) {
          let solveData = solve.filter((row) => row.VISIT_ID == data.ID);
          $("#visit_form_page .problem_list").html("");
          if (solveData.length > 0) {
            for (let index = 0; index < solveData.length; index++) {
              $(`#visit_form_page .problem_list`)
                .append(`<div class="problem_wrapper">
                <div class="problem_index">${index + 1}</div>
                <label>${solveData[index].SOLVE_NAME}</label>
                <div class="problem_dismiss">
                  <i class="fa fa-minus" aria-hidden="true"></i>
                </div>
                </div>`);
            }
          }
        });
      });
      $(".step-footer .btn_group.add").hide();
      $(".step-footer .btn_group.read").css("display", "flex");

      $('#visit_form_page input[type="text"]').prop("readonly", true);
      $('#visit_form_page input[type="radio"]').prop("disabled", true);
      $('#visit_form_page input[type="checkbox"]').prop("disabled", true);

      $(".toggle_input_group.summarize").removeClass("add");
      $(".toggle_input_group.summarize").addClass("read");
      $(".toggle_input_group.summarize").show();
      loading.show();
      setTimeout(function () {
        loading.hide();
        changePage("visit_form_page", function () {});
      }, 500);
    });
  }
  var allowNext;
  function initialVisitFormPage(bAllowNext = false) {
    allowNext = bAllowNext;
    resetVisitForm();
    $(".visit_section1").on("click", function () {
      var selected = $(this).val();
      if (selected == "0") {
        disableNextVisit(false);
      } else {
        disableNextVisit(true);
      }
    });
    $("ul.visit_form li").each(function (i, obj) {
      $(this)
        .children("input[type='radio']")
        .on("click", function () {
          $(this)
            .parent()
            .parent()
            .children("li")
            .each(function () {
              $(this).children(".toggle_input_group").hide();
            });
          var selected = $(this).val();
          $(this).siblings(".toggle_input_group").show();
          $(this).siblings(".toggle_input_group").children("input").val("");
          $(this)
            .siblings(".toggle_input_group")
            .children("input")
            .first()
            .focus();
        });
      $(this)
        .children("input[type='checkbox']")
        .on("change", function () {
          if (this.checked) {
            $(this).siblings("input[type='text']").prop("disabled", false);
            $(this).siblings("input[type='text']").val("");
            $(this).siblings("input[type='text']").first().focus();
          } else {
            $(this).siblings("input[type='text']").prop("disabled", true);
            $(this).siblings("input[type='text']").val("");
          }
        });
    });
    $(".summarize_radio").on("click", function () {
      if ($(this).val() == 1) {
        $(".toggle_input_group.summarize").show();
        $(".toggle_input_group.summarize").find("input").first().focus();
      } else {
        $(".toggle_input_group.summarize").hide();
      }
    });

    $("#visit_section1_1_input").on("change paste keyup", function () {
      if ($(this).val().length != 0) {
        disableNextVisit(false);
      } else {
        disableNextVisit(true);
      }
    });
  }
  var steps;
  function resetVisitForm() {
    $(
      '#visit_form_page input[type="text"],#visit_form_page input[type="number"]'
    ).val("");
    $(
      '#visit_form_page input[type="checkbox"],#visit_form_page input[type="radio"]'
    ).prop("checked", false);
    $("#visit_form_page .toggle_input_group").hide();
    $("#visit_form_page .problem_list").html("");
    $(".step-btn.next").prop("disabled", false);

    setProgressVisit(1);
    steps = $("#visit_form_page").steps({
      onFinish: function () {
        // $(
        //   "#visit_form_page .header .back_header_btn,.step-footer .step-btn.cancel"
        // ).click();
        visitSubmit();
      },
      onChange: function (currentIndex, newIndex, stepDirection) {
        $('.content').animate({
          scrollTop: $(".content").offset().top
        },0);
        $(".progress_complete").hide();
        $(".step-btn.next").addClass("arrow");
        $(".step-btn.prev").addClass("arrow");
        if (newIndex < 6) {
          showSummarizeHeader(false);
          $(".current_step_index_visit_form").text(newIndex + 1);
          if (newIndex == 5) {
            $(".next_step_index_visit_form").text("สรุป");
            $(".step-btn.next").removeClass("arrow");
          } else {
            $(".next_step_index_visit_form").text(newIndex + 2);
          }

          $(".prev_step_index_visit_form").text(newIndex);
          if (currentIndex == 0) {
            $(".step-btn.cancel").show();
            $(".step-btn.prev").hide();
          } else if (currentIndex < 6) {
            $(".step-btn.cancel").hide();
            $(".step-btn.prev").show();
          }
          setProgressVisit(currentIndex + 1);
        }
        if (newIndex == 6) {
          showSummarizeHeader(true);
          $(".progress_complete").show();

          $(".prev_step_index_visit_form").text("แก้ไข");
          $(".step-btn.prev").removeClass("arrow");
        }

        disableNextVisit(true);
        switch (currentIndex) {
          case 0:
            validateVisitForm1();
            break;
          case 1:
            validateVisitForm2();
            break;
          case 2:
            validateVisitForm3();
            break;
          case 3:
            validateVisitForm4();
            break;
          case 4:
            validateVisitForm5();
            break;
          case 5:
            validateVisitForm6();
            break;
          case 6:
            validateVisitFormSummarize();
            break;
          default:
            break;
        }

        return true;
      },
    });
    steps_api = steps.data("plugin_Steps");
    steps_api.setStepIndex(0);
    disableNextVisit(!allowNext);
    $("#visit_form_page .step-steps > li").off()
  }
  function validateVisitFormSummarize() {
    let SOLVE0 = $('#visit_form_page input[name="SOLVE0"]:checked').val();
    let problem_list = $("#visit_form_page .problem_list").children();
    console.log(SOLVE0, problem_list);
    if (!allowNext) {
      if (validateForm([SOLVE0])) {
        console.log(SOLVE0, problem_list.length);
        if (SOLVE0 == 1 && problem_list.length == 0) {
          $(".step-btn.finish").prop("disabled", true);
        } else {
          $(".step-btn.finish").prop("disabled", false);
        }
      } else {
        $(".step-btn.finish").prop("disabled", true);
      }
    } else {
      $(".step-btn.finish").prop("disabled", false);
    }
  }
  $('#visit_form_page [data-step="summarize"] input[type="radio"]').on(
    "change",
    function () {
      validateVisitFormSummarize();
    }
  );
  function validateVisitForm1() {
    let VISIT1 = $('#visit_form_page input[name="VISIT1"]:checked').val();
    let VISIT1_DESC = $("#VISIT1_DESC").val();
    if (!allowNext) {
      if (validateForm([VISIT1])) {
        if (VISIT1 == 1 && VISIT1_DESC == "") {
          disableNextVisit(true);
        } else {
          disableNextVisit(false);
        }
      } else {
        disableNextVisit(true);
      }
    } else {
      disableNextVisit(false);
    }
  }
  $('#visit_form_page [data-step="step1"] input[type="radio"]').on(
    "change",
    function () {
      validateVisitForm1();
    }
  );
  $('#visit_form_page [data-step="step1"] input[type="text"]').on(
    "keyup",
    function () {
      validateVisitForm1();
    }
  );
  function validateVisitForm2() {
    let VISIT2A = $('#visit_form_page input[name="VISIT2A"]:checked').val();
    let VISIT2B = $('#visit_form_page input[name="VISIT2B"]:checked').val();
    let VISIT2C = $('#visit_form_page input[name="VISIT2C"]:checked').val();
    let VISIT2D = $('#visit_form_page input[name="VISIT2D"]:checked').val();

    let VISIT2B_NAME1 = $("#VISIT2B_NAME1").val();
    let VISIT2B_TEL1 = $("#VISIT2B_TEL1").val();
    let VISIT2B_NAME2 = $("#VISIT2B_NAME2").val();
    let VISIT2B_TEL2 = $("#VISIT2B_TEL2").val();
    if (!allowNext) {
      if (validateForm([VISIT2A, VISIT2B, VISIT2C, VISIT2D])) {
        if (VISIT2B == 1 && !validateForm([VISIT2B_NAME1, VISIT2B_TEL1])) {
          disableNextVisit(true);
        } else if (
          VISIT2B == 2 &&
          !validateForm([VISIT2B_NAME2, VISIT2B_TEL2])
        ) {
          disableNextVisit(true);
        } else {
          disableNextVisit(false);
        }
      } else {
        disableNextVisit(true);
      }
    } else {
      disableNextVisit(false);
    }
  }
  $('#visit_form_page [data-step="step2"] input[type="radio"]').on(
    "change",
    function () {
      validateVisitForm2();
    }
  );
  $('#visit_form_page [data-step="step2"] input[type="text"]').on(
    "keyup",
    function () {
      validateVisitForm2();
    }
  );
  function validateVisitForm3() {
    let VISIT3A_WEIGHT = $("#VISIT3A_WEIGHT").val();
    let VISIT3A_HEIGHT = $("#VISIT3A_HEIGHT").val();
    let VISIT3A_SBP = $("#VISIT3A_SBP").val();
    let VISIT3A_DBP = $("#VISIT3A_DBP").val();
    let VISIT3A_PULSE = $("#VISIT3A_PULSE").val();

    let VISIT3B = $('#visit_form_page input[name="VISIT3B"]:checked').val();
    let VISIT3C = $('#visit_form_page input[name="VISIT3C"]:checked').val();
    let VISIT3DA = $("#VISIT3DA").prop("checked");
    let VISIT3DB = $("#VISIT3DB").prop("checked");
    let VISIT3DC = $("#VISIT3DC").prop("checked");

    let VISIT3DC_DESC = $("#VISIT3DC_DESC").val();
    let VISIT3EA = $("#VISIT3EA").prop("checked");
    let VISIT3EB = $("#VISIT3EB").prop("checked");

    let VISIT3F = $('#visit_form_page input[name="VISIT3F"]:checked').val();
    if (!allowNext) {
      if (
        validateForm([
          VISIT3A_WEIGHT,
          VISIT3A_HEIGHT,
          VISIT3A_SBP,
          VISIT3A_DBP,
          VISIT3A_PULSE,
          VISIT3B,
          VISIT3C,
          VISIT3F,
        ])
      ) {
        if (VISIT3DC == true && !validateForm([VISIT3DC_DESC])) {
          disableNextVisit(true);
        } else {
          disableNextVisit(false);
        }
      } else {
        disableNextVisit(true);
      }
    } else {
      disableNextVisit(false);
    }
  }
  $(
    '#visit_form_page [data-step="step3"] input[type="radio"],#visit_form_page [data-step="step3"] input[type="checkbox"]'
  ).on("change", function () {
    validateVisitForm3();
  });
  $(
    '#visit_form_page [data-step="step3"] input[type="text"],#visit_form_page [data-step="step3"] input[type="number"]'
  ).on("keyup", function () {
    validateVisitForm3();
  });
  function validateVisitForm4() {
    let VISIT4A = $('#visit_form_page input[name="VISIT4A"]:checked').val();
    let VISIT4B = $('#visit_form_page input[name="VISIT4B"]:checked').val();
    let VISIT4C = $('#visit_form_page input[name="VISIT4C"]:checked').val();
    let VISIT4DA = $("#VISIT4DA").prop("checked");
    let VISIT4DB = $("#VISIT4DB").prop("checked");
    let VISIT4D_DESC = $("#VISIT4D_DESC").val();
    let VISIT4EA = $('#visit_form_page input[name="VISIT4EA"]:checked').val();
    let VISIT4E_DESC = $("#VISIT4E_DESC").val();

    if (!allowNext) {
      if (validateForm([VISIT4A, VISIT4B, VISIT4C, VISIT4EA])) {
        if (VISIT4DB == true && !validateForm([VISIT4D_DESC])) {
          disableNextVisit(true);
        } else if (VISIT4EA == 1 && !validateForm([VISIT4E_DESC])) {
          disableNextVisit(true);
        } else {
          disableNextVisit(false);
        }
      } else {
        disableNextVisit(true);
      }
    } else {
      disableNextVisit(false);
    }
  }
  $(
    '#visit_form_page [data-step="step4"] input[type="radio"],#visit_form_page [data-step="step4"] input[type="checkbox"]'
  ).on("change", function () {
    validateVisitForm4();
  });
  $(
    '#visit_form_page [data-step="step4"] input[type="text"],#visit_form_page [data-step="step4"] input[type="number"]'
  ).on("keyup", function () {
    validateVisitForm4();
  });
  function validateVisitForm5() {
    let VISIT5A1 = $("#VISIT5A1").prop("checked");
    let VISIT5A2 = $("#VISIT5A2").prop("checked");
    let VISIT5A3 = $("#VISIT5A3").prop("checked");
    let VISIT5A4 = $("#VISIT5A4").prop("checked");
    let VISIT5A5 = $("#VISIT5A5").prop("checked");
    let VISIT5B1 = $("#VISIT5B1").prop("checked");
    let VISIT5B2 = $("#VISIT5B2").prop("checked");
    let VISIT5B3 = $("#VISIT5B3").prop("checked");
    let VISIT5B4 = $("#VISIT5B4").prop("checked");
    let VISIT5C1 = $("#VISIT5C1").prop("checked");
    let VISIT5C2 = $("#VISIT5C2").prop("checked");
    let VISIT5C3 = $("#VISIT5C3").prop("checked");
    let VISIT5C4 = $("#VISIT5C4").prop("checked");
    if (!allowNext) {
      if (true) {
        disableNextVisit(false);
      }
    } else {
      disableNextVisit(false);
    }
  }
  $(
    '#visit_form_page [data-step="step5"] input[type="radio"],#visit_form_page [data-step="step5"] input[type="checkbox"]'
  ).on("change", function () {
    validateVisitForm5();
  });
  $(
    '#visit_form_page [data-step="step5"] input[type="text"],#visit_form_page [data-step="step5"] input[type="number"]'
  ).on("keyup", function () {
    validateVisitForm5();
  });
  function validateVisitForm6() {
    let allCheckbox = $(
      '#visit_form_page [data-step="step6"] input[type="checkbox"]'
    );
    let valueList = [];
    $.each(allCheckbox, function (index, value) {
      valueList.push($(this).prop("checked"));
    });
    if (!allowNext) {
      if (validateForm(valueList)) {
        disableNextVisit(false);
      } else {
        disableNextVisit(true);
      }
    } else {
      disableNextVisit(false);
    }
  }
  $(
    '#visit_form_page [data-step="step6"] input[type="radio"],#visit_form_page [data-step="step6"] input[type="checkbox"]'
  ).on("change", function () {
    validateVisitForm6();
  });
  $(
    '#visit_form_page [data-step="step6"] input[type="text"],#visit_form_page [data-step="step6"] input[type="number"]'
  ).on("keyup", function () {
    validateVisitForm6();
  });
  function visitSubmit() {
    if (!allowNext) {
      let VISIT1 = $('#visit_form_page input[name="VISIT1"]:checked').val();
      let VISIT1_DESC = $("#VISIT1_DESC").val();

      let VISIT2A = $('#visit_form_page input[name="VISIT2A"]:checked').val();
      let VISIT2B = $('#visit_form_page input[name="VISIT2B"]:checked').val();
      let VISIT2C = $('#visit_form_page input[name="VISIT2C"]:checked').val();
      let VISIT2D = $('#visit_form_page input[name="VISIT2D"]:checked').val();

      let VISIT2B_NAME1 = $("#VISIT2B_NAME1").val();
      let VISIT2B_TEL1 = $("#VISIT2B_TEL1").val();
      let VISIT2B_NAME2 = $("#VISIT2B_NAME2").val();
      let VISIT2B_TEL2 = $("#VISIT2B_TEL2").val();

      let VISIT3A_WEIGHT = $("#VISIT3A_WEIGHT").val();
      let VISIT3A_HEIGHT = $("#VISIT3A_HEIGHT").val();
      let VISIT3A_SBP = $("#VISIT3A_SBP").val();
      let VISIT3A_DBP = $("#VISIT3A_DBP").val();
      let VISIT3A_PULSE = $("#VISIT3A_PULSE").val();

      let VISIT3B = $('#visit_form_page input[name="VISIT3B"]:checked').val();
      let VISIT3C = $('#visit_form_page input[name="VISIT3C"]:checked').val();
      let VISIT3DA = $("#VISIT3DA").prop("checked")==true?1:0;
      let VISIT3DB = $("#VISIT3DB").prop("checked")==true?1:0;
      let VISIT3DC = $("#VISIT3DC").prop("checked")==true?1:0;

      let VISIT3DC_DESC = $("#VISIT3DC_DESC").val();
      let VISIT3EA = $("#VISIT3EA").prop("checked")==true?1:0;
      let VISIT3EB = $("#VISIT3EB").prop("checked")==true?1:0;

      let VISIT3F = $('#visit_form_page input[name="VISIT3F"]:checked').val();

      let VISIT4A = $('#visit_form_page input[name="VISIT4A"]:checked').val();
      let VISIT4B = $('#visit_form_page input[name="VISIT4B"]:checked').val();
      let VISIT4C = $('#visit_form_page input[name="VISIT4C"]:checked').val();
      let VISIT4DA = $("#VISIT4DA").prop("checked")==true?1:0;
      let VISIT4DB = $("#VISIT4DB").prop("checked")==true?1:0;
      let VISIT4D_DESC = $("#VISIT4D_DESC").val();
      let VISIT4EA = $('#visit_form_page input[name="VISIT4EA"]:checked').val();
      let VISIT4E_DESC = $("#VISIT4E_DESC").val();

      let VISIT5A1 = $("#VISIT5A1").prop("checked")==true?1:0;
      let VISIT5A2 = $("#VISIT5A2").prop("checked")==true?1:0;
      let VISIT5A3 = $("#VISIT5A3").prop("checked")==true?1:0;
      let VISIT5A4 = $("#VISIT5A4").prop("checked")==true?1:0;
      let VISIT5A5 = $("#VISIT5A5").prop("checked")==true?1:0;
      let VISIT5B1 = $("#VISIT5B1").prop("checked")==true?1:0;
      let VISIT5B2 = $("#VISIT5B2").prop("checked")==true?1:0;
      let VISIT5B3 = $("#VISIT5B3").prop("checked")==true?1:0;
      let VISIT5B4 = $("#VISIT5B4").prop("checked")==true?1:0;
      let VISIT5C1 = $("#VISIT5C1").prop("checked")==true?1:0;
      let VISIT5C2 = $("#VISIT5C2").prop("checked")==true?1:0;
      let VISIT5C3 = $("#VISIT5C3").prop("checked")==true?1:0;
      let VISIT5C4 = $("#VISIT5C4").prop("checked")==true?1:0;
      let SOLVE0 = $('#visit_form_page input[name="SOLVE0"]:checked').val();
      let problem_list = $("#visit_form_page .problem_list").children();

      let elder_id = visit_elder_id
      queryALL("VHV_TR_VISIT",function(vhv_tr_visit){
        oldList = vhv_tr_visit.filter(row =>row.ELDER_ID==elder_id && getCurrentDate().substring(0,7)==row.VISIT_DATE.substring(0,7))
        let VISIT_NO = 1;
        if(oldList.length>0){
          VISIT_NO = oldList.length+1
        }
        let data = {
          ELDER_ID:elder_id,
          VISIT_DATE:getCurrentDate(),
          VISIT_NO:VISIT_NO,
          VISIT1,
          VISIT1_DESC,
          VISIT2A,
          VISIT2B,
          VISIT2B_NAME1,
          VISIT2B_TEL1,
          VISIT2B_NAME2,
          VISIT2B_TEL2,
          VISIT2C,
          VISIT2D,
          VISIT3A_WEIGHT,
          VISIT3A_HEIGHT,
          VISIT3A_SBP,
          VISIT3A_DBP,
          VISIT3A_PULSE,
          VISIT3B,
          VISIT3C,
          VISIT3DA,
          VISIT3DB,
          VISIT3DC,
          VISIT3DC_DESC,
          VISIT3EA,
          VISIT3EB,
          VISIT3F,
          VISIT4A,
          VISIT4B,
          VISIT4C,
          VISIT4DA,
          VISIT4D_DESC,
          VISIT4EA,
          VISIT4E_DESC,
          VISIT5A1,
          VISIT5A2,
          VISIT5A3,
          VISIT5A4,
          VISIT5A5,
          VISIT5B1,
          VISIT5B2,
          VISIT5B3,
          VISIT5B4,
          VISIT5C1,
          VISIT5C2,
          VISIT5C3,
          VISIT5C4,
          SOLVE0
        }
        sqlInsert("VHV_TR_VISIT", data, function (inserted_id) {
          console.log(inserted_id)
          if(SOLVE0==1){
            $.each(problem_list, function (index, value) {
              let detailData = {
                VISIT_ID :inserted_id,
                SOLVE_NAME:$(this).find("label").text()
              }
              console.log($(this).find("label").text())
              sqlInsert("VHV_TR_SOLVE", detailData, function (inserted_id) {

              })
            })
            showModal('modal-profile-save-success')
            setTimeout(function(){
              $(".modal").fadeOut();
            },2000)
            $(".status-card.visit").click();
          }else{
            showModal('modal-profile-save-success')
            setTimeout(function(){
              $(".modal").hide();
            },2000)
            $(".status-card.visit").click();
          }
          sqlUpdate(
            "VHV_TR_ELDER",
            { VISIT_STATUS: 1, UPDATE_FLAG: 1 },
            elder_id,
            function (res) {
              readerAfterSaveVisit()
              reloadVisitList();
              renderElderListVisit(function(){
              })

            }
          );
        })
      })
      
    } else {
      $(".status-card.visit").click();
    }
  }
  function showSummarizeHeader(show) {
    if (show) {
      $(".step-app .header").hide();
      $("#visit_form_page .content").addClass("top0");
    } else {
      $(".step-app .header").show();
      $("#visit_form_page .content").removeClass("top0");
    }
  }
  $(".btn_add_problem").on("click", function () {
    let value = $("#summarize_input1").val();
    if (value.length != 0) {
      pushProblem(value);
    }
    $(".toggle_input_group.summarize.add .problem_dismiss").on(
      "click",
      function () {
        $(this).parent().remove();
        $.each($(".problem_list").children(), function (index, value) {
          $(this)
            .find(".problem_index")
            .text(index + 1);
        });
      }
    );
  });

  function pushProblem(value) {
    let index =
      $("#visit_form_page .content_toggle_input_group .problem_list").children()
        .length + 1;
    let element = `<div class="problem_wrapper">
    <div class="problem_index">
      ${index}
    </div>
    <label>${value}</label>
    <div class="problem_dismiss">
      <i class="fa fa-minus" aria-hidden="true"></i>
    </div>
  </div>`;
    $("#visit_form_page .content_toggle_input_group .problem_list").append(
      element
    );
    $("#summarize_input1").val("");
    $("#summarize_input1").focus();
    validateVisitFormSummarize();
  }
  function setProgressVisit(percent) {
    var circle = document.querySelector(".progress_ring_circle_visit");
    var radius = circle.r.baseVal.value;
    var circumference = radius * 2 * Math.PI;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
    const offset =
      circumference - ((percent * (100 / 6)) / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }
  function disableNextVisit(disabled) {
    $(".step-btn.next").prop("disabled", disabled);
  }
  $("#visit_page .header .back_header_btn").on("click", function () {
    changePage('home_page', function () {
    });
  });
  $("#visit_detail_page .header .back_header_btn").on("click", function () {
    changePage(visit_from_page, function () {
      // $("#visit_form_page").destroy();
    });
  });
  $(
    "#visit_form_page .header .back_header_btn,.step-footer .step-btn.cancel"
  ).on("click", function () {
    console.log(allowNext);
    if (!allowNext) {
      showModal("modal-visit-alert");
    } else {
      changePage("visit_detail_page", function () {});
    }
  });
  $("#visit_form_page #modal-visit-alert .submit_alret").on(
    "click",
    function () {
      changePage("visit_detail_page", function () {});
    }
  );
  $("#visit_form_page #modal-visit-alert .cancel_alret").on(
    "click",
    function () {
      $("#modal-visit-alert .modal-dismiss").click();
    }
  );
  $(".btn_create_visit").on("click", function () {
    $(".step-footer .btn_group.add").css("display", "flex");
    $(".step-footer .btn_group.read").hide();
    initialVisitFormPage(false);
    $('#visit_form_page input[type="text"]').prop("readonly", false);
    $('#visit_form_page input[type="radio"]').prop("disabled", false);
    $('#visit_form_page input[type="checkbox"]').prop("disabled", false);

    $('#visit_form_page input[type="text"]').val("");
    $('#visit_form_page input[type="radio"]').prop("checked", false);
    $('#visit_form_page input[type="checkbox"]').prop("checked", false);
    $(".input_from_checkbox").prop("disabled", true);
    $(".toggle_input_group.summarize").hide();
    $(".toggle_input_group.summarize").removeClass("read");
    $(".toggle_input_group.summarize").addClass("add");
    changePage("visit_form_page", function () {});
  });
});
