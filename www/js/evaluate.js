$(function () {
  let evaluate_elder_id
  let evaluate_from_page
  $(".main_home_menu_item_wrapper img")
    .eq(0)
    .on("click", function () {
      loading.show();

      setTimeout(function () {
        changePage("evaluate_page", function () {
          initialEvaPage();
        });
      }, 500);
    });
  function initialEvaPage() {
    listElderEvaluate(function (waitList, evaluatedList) {
      loading.hide();
      $("#eva_waiting_list").html("");
      $("#eva_evaluated_list").html("");
      $("#evaluate_page .sort-bar h4 span").html(
        `${waitList.length + evaluatedList.length} คน`
      );
      $(".eva_waiting_list_count").text(`...กำลังรอยู่ ${waitList.length} คน`);
      $(".eva_evaluated_list_count").text(`จำนวน ${evaluatedList.length} คน`);
      $.each(waitList, function (index, row) {
        $("#eva_waiting_list").append(renderElderCard(row));
      });
      $.each(evaluatedList, function (index, row) {
        $("#eva_evaluated_list").append(renderElderCard(row));
      });

      // setTimeout(function () {
      //   if (waitList.length > 0) {
      //     renderElderModal(waitList[0],"modal-evaluate-detail",true,false);
      //     $("#evaluate_recommend").show();
      //   }
      // }, 500);
    });
    queryALL("VHV_MA_GIS_PROVINCE", function (res) {
      if(res){
        $("#evaluate_page .content .collapse-filter #evaSearchProvince").val(
          "จังหวัด " + res[0]["GIS_PROVINCENAME"]
        );
      }else{
        $("#evaluate_page .content .collapse-filter #evaSearchProvince").val(
          "จังหวัด "
        );
      }
    });
    queryALL("VHV_MA_GIS_TUMBOL", function (res) {
      if(res){
        $("#evaluate_page .content .collapse-filter #evaSearchTumbol").val(
          "ตำบล " + res[0]["GIS_TUMBOLNAME"]
        );
      }else{
        $("#evaluate_page .content .collapse-filter #evaSearchTumbol").val(
          "ตำบล "
        );
      }
    });
    queryALL("VHV_MA_SHPH_MOO", function (res) {
      if(res){
        $("#evaluate_page .content .collapse-filter #evaSearchMoo").val(
          "หมู่ที่ " + res[0]["SHPH_MOO"]
        );
      }else{
        $("#evaluate_page .content .collapse-filter #evaSearchMoo").val(
          "หมู่ที่ "
        );
      }
    });
  }
  $("#evaluate_page .collapse-filter .collapse-filter-header").click(
    function () {
      $header = $(this);
      $content = $header.next();
      $(".toggle", this).toggleClass("fa-chevron-up fa-chevron-down");
      $content.slideToggle(200, function () {});
    }
  );
  $("#evaluate_page .btn-sort").on("click", function () {
    showModal("modal-sort-evaluate");
  });

  $("#evaluate_page .contact_items").on("click", "li", function () {
    queryByID("VHV_TR_ELDER", $(this).attr("ELDER_ID"), function (res) {
      renderElderModal(res,"modal-evaluate-detail",true,false);
    });
  });
  // ปุ่ม ยืนยัน modal-evaluate-alert
  $("#modal-evaluate-alert .submit_alret").on("click", function () {
    changePage("evaluate_detail_page", function () {
      readerAfterSaveEva();
    });
    $(".modal").hide();
    $("body").removeClass("modal-open");
  });
  // ปุ่ม ยกเลิก modal-evaluate-alert
  $("#modal-evaluate-alert .cancel_alret").on("click", function () {
    $(".modal").hide();
    $("body").removeClass("modal-open");
  });
  /* ----------------------------------------------------------------------------- start : evaluate_page ----------------------------------------------------------------------------- */
  $("#evaluate_page .header .back_header_btn").on("click", function () {
    changePage('home_page', function () {
    });
  });
  /* ----------------------------------------------------------------------------- end : evaluate_page ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_detail_page ----------------------------------------------------------------------------- */
  // StepProgresse
  function reloadEvaluateList() {
    
    let elder_id = evaluate_elder_id;
    let evaluateData = [];
    console.log(elder_id);
    queryALL("VHV_TR_ELDER", function (ELDER) {
      $("#evaluate_detail_page .contact_items").html(
        renderElderCard(
          ELDER.find((item) => item.ID == elder_id),
          false
        )
      );
    });
    queryALL("VHV_TR_EVALUATE1", function (EVALUATE1) {
      let eva = EVALUATE1.filter((item) => item.ELDER_ID == elder_id);
      let lastData = eva ? eva[eva.length - 1] : undefined;
      let total1 = EVALUATE1.filter((item) => item.ELDER_ID == elder_id).length;
      evaluateData.push({
        evaNo: 1,
        evaName: "แบบประเมินโรคเบาหวาน",
        updateDate: lastData ? dateStringFormat(lastData.EVALUATE_DATE) : "ไม่มีข้อมูล",

        last_data: lastData,
        total: total1,
      });
      queryALL("VHV_TR_EVALUATE2", function (EVALUATE2) {
        let eva = EVALUATE2.filter((item) => item.ELDER_ID == elder_id);
        let lastData = eva ? eva[eva.length - 1] : undefined;
        let total2 = EVALUATE2.filter(
          (item) => item.ELDER_ID == elder_id
        ).length;
        evaluateData.push({
          evaNo: 2,
          evaName: "แบบประเมินโรคความดันโลหิตสูง",
          updateDate: lastData ? dateStringFormat(lastData.EVALUATE_DATE) : "ไม่มีข้อมูล",
          // recommend: lastData
          //   ? `ตัวบน: ${lastData.RESULTSBP},ตัวล่าง: ${lastData.RESULTDBP}`
          //   : "",
          recommend: lastData
            ? // ? `ตัวบน: ${lastData.RESULTSBP},ตัวล่าง: ${lastData.RESULTDBP}`
              lastData.FLAGSBP >= lastData.FLAGDBP
              ? lastData.RESULTSBP
              : lastData.RESULTDBP
            : "",
          // warningCard: lastData
          //   ? lastData.FLAGSBP == 0 || lastData.FLAGDBP == 0
          //     ? true
          //     : false
          //   : false,
          warningCard: lastData
            ? lastData.FLAGSBP >= lastData.FLAGDBP
              ? lastData.FLAGSBP == 0
                ? ""
                : lastData.FLAGSBP == 1
                ? "care_of_doctor-yellow"
                : lastData.FLAGSBP == 2
                ? "care_of_doctor"
                : lastData.FLAGSBP == 3
                ? "care_of_doctor-red"
                : ""
              : lastData.FLAGDBP == 0
              ? ""
              : lastData.FLAGDBP == 1
              ? "care_of_doctor-yellow"
              : lastData.FLAGDBP == 2
              ? "care_of_doctor"
              : lastData.FLAGDBP == 3
              ? "care_of_doctor-red"
              : ""
            : "",
          last_data: lastData,
          total: total2,
        });
        queryALL("VHV_TR_EVALUATE3", function (EVALUATE3) {
          let eva = EVALUATE3.filter((item) => item.ELDER_ID == elder_id);
          let lastData = eva ? eva[eva.length - 1] : undefined;
          let total3 = EVALUATE3.filter(
            (item) => item.ELDER_ID == elder_id
          ).length;
          evaluateData.push({
            evaNo: 3,
            evaName: "แบบประเมินโรคหัวใจและหลอดเลือด",
            updateDate: lastData ? dateStringFormat(lastData.EVALUATE_DATE) : "ไม่มีข้อมูล",

            last_data: lastData,
            total: total3,
          });
          queryALL("VHV_TR_EVALUATE4", function (EVALUATE4) {
            let eva = EVALUATE4.filter((item) => item.ELDER_ID == elder_id);
            let lastData = eva ? eva[eva.length - 1] : undefined;
            let total4 = EVALUATE4.filter(
              (item) => item.ELDER_ID == elder_id
            ).length;
            evaluateData.push({
              evaNo: 4,
              evaName: "แบบประเมินสมองเสื่อม",
              updateDate: lastData ? dateStringFormat(lastData.EVALUATE_DATE) : "ไม่มีข้อมูล",

              last_data: lastData,
              total: total4,
            });
            queryALL("VHV_TR_EVALUATE5", function (EVALUATE5) {
              let eva = EVALUATE5.filter((item) => item.ELDER_ID == elder_id);
              let lastData = eva ? eva[eva.length - 1] : undefined;
              let total5 = EVALUATE5.filter(
                (item) => item.ELDER_ID == elder_id
              ).length;
              evaluateData.push({
                evaNo: 5,
                evaName: "แบบประเมินโรคซึมเศร้า",
                updateDate: lastData ? dateStringFormat(lastData.EVALUATE_DATE) : "ไม่มีข้อมูล",

                last_data: lastData,
                total: total5,
              });
              queryALL("VHV_TR_EVALUATE6", function (EVALUATE6) {
                let eva = EVALUATE6.filter((item) => item.ELDER_ID == elder_id);
                let lastData = eva ? eva[eva.length - 1] : undefined;
                let total6 = EVALUATE6.filter(
                  (item) => item.ELDER_ID == elder_id
                ).length;
                evaluateData.push({
                  evaNo: 6,
                  evaName: "แบบประเมินโรคข้อเข่าเสื่อม",
                  updateDate: lastData ? dateStringFormat(lastData.EVALUATE_DATE) : "ไม่มีข้อมูล",

                  last_data: lastData,
                  total: total6,
                });
                queryALL("VHV_TR_EVALUATE7", function (EVALUATE7) {
                  let eva = EVALUATE7.filter(
                    (item) => item.ELDER_ID == elder_id
                  );
                  let lastData = eva ? eva[eva.length - 1] : undefined;
                  let total7 = EVALUATE7.filter(
                    (item) => item.ELDER_ID == elder_id
                  ).length;
                  evaluateData.push({
                    evaNo: 7,
                    evaName: "แบบประเมินภาวะหกล้ม",
                    updateDate: lastData
                      ? dateStringFormat(lastData.EVALUATE_DATE)
                      : "ไม่มีข้อมูล",

                    last_data: lastData,
                    total: total7,
                  });
                  queryALL("VHV_TR_EVALUATE8", function (EVALUATE8) {
                    let eva = EVALUATE8.filter(
                      (item) => item.ELDER_ID == elder_id
                    );
                    let lastData = eva ? eva[eva.length - 1] : undefined;
                    let total8 = EVALUATE8.filter(
                      (item) => item.ELDER_ID == elder_id
                    ).length;
                    evaluateData.push({
                      evaNo: 8,
                      evaName: "แบบประเมินสุขภาวะทางตา",
                      updateDate: lastData
                        ? dateStringFormat(lastData.EVALUATE_DATE)
                        : "ไม่มีข้อมูล",

                      last_data: lastData,
                      total: total8,
                    });
                    queryALL("VHV_TR_EVALUATE9", function (EVALUATE9) {
                      let eva = EVALUATE9.filter(
                        (item) => item.ELDER_ID == elder_id
                      );
                      let lastData = eva ? eva[eva.length - 1] : undefined;
                      let total9 = EVALUATE9.filter(
                        (item) => item.ELDER_ID == elder_id
                      ).length;
                      evaluateData.push({
                        evaNo: 9,
                        evaName: "แบบประเมินการได้ยิน",
                        updateDate: lastData
                          ? dateStringFormat(lastData.EVALUATE_DATE)
                          : "ไม่มีข้อมูล",

                        last_data: lastData,
                        total: total9,
                      });
                      queryALL("VHV_TR_EVALUATE10", function (EVALUATE10) {
                        let eva = EVALUATE10.filter(
                          (item) => item.ELDER_ID == elder_id
                        );
                        let lastData = eva ? eva[eva.length - 1] : undefined;
                        let total10 = EVALUATE10.filter(
                          (item) => item.ELDER_ID == elder_id
                        ).length;
                        evaluateData.push({
                          evaNo: 10,
                          evaName: "แบบประเมินปัญหาการนอน",
                          updateDate: lastData
                            ? dateStringFormat(lastData.EVALUATE_DATE)
                            : "ไม่มีข้อมูล",

                          last_data: lastData,
                          total: total10,
                        });
                        queryALL("VHV_TR_EVALUATE11", function (EVALUATE11) {
                          let eva = EVALUATE11.filter(
                            (item) => item.ELDER_ID == elder_id
                          );
                          let lastData = eva ? eva[eva.length - 1] : undefined;
                          let total11 = EVALUATE11.filter(
                            (item) => item.ELDER_ID == elder_id
                          ).length;
                          evaluateData.push({
                            evaNo: 11,
                            evaName: "แบบประเมินสุขภาพช่องปาก",
                            updateDate: lastData
                              ? dateStringFormat(lastData.EVALUATE_DATE)
                              : "ไม่มีข้อมูล",

                            last_data: lastData,
                            total: total11,
                          });
                          queryALL("VHV_TR_EVALUATE12", function (EVALUATE12) {
                            let eva = EVALUATE12.filter(
                              (item) => item.ELDER_ID == elder_id
                            );
                            let lastData = eva
                              ? eva[eva.length - 1]
                              : undefined;
                            let total12 = EVALUATE12.filter(
                              (item) => item.ELDER_ID == elder_id
                            ).length;
                            evaluateData.push({
                              evaNo: 12,
                              evaName: "แบบประเมินภาวะโภชนาการ",
                              updateDate: lastData
                                ? dateStringFormat(lastData.EVALUATE_DATE)
                                : "ไม่มีข้อมูล",

                              last_data: lastData,
                              total: total12,
                            });
                            queryALL(
                              "VHV_TR_EVALUATE13",
                              function (EVALUATE13) {
                                let eva = EVALUATE13.filter(
                                  (item) => item.ELDER_ID == elder_id
                                );
                                let lastData = eva
                                  ? eva[eva.length - 1]
                                  : undefined;
                                let total13 = EVALUATE13.filter(
                                  (item) => item.ELDER_ID == elder_id
                                ).length;
                                evaluateData.push({
                                  evaNo: 13,
                                  evaName: "แบบประเมินการทํากิจวัตรประจําวัน",
                                  updateDate: lastData
                                    ? dateStringFormat(lastData.EVALUATE_DATE)
                                    : "ไม่มีข้อมูล",
                                  last_data: lastData,
                                  total: total13,
                                });
                                for (
                                  let index = 0;
                                  index < evaluateData.length;
                                  index++
                                ) {
                                  const evaluate = evaluateData[index];
                                  console.log(evaluate);
                                  $(
                                    "#evaluate_detail_page .list_item_group"
                                  ).append(function () {
                                    return $(`<div lastEvalutateId=${
                                      evaluate.last_data
                                        ? evaluate.last_data.rowid
                                        : 0
                                    } class="evaluate_card ${
                                      evaluate.total == 0
                                        ? "pending"
                                        : `${
                                            evaluate.evaNo == 2
                                              ? evaluate.warningCard
                                              : // ? "care_of_doctor"
                                              // : ""
                                              evaluate.last_data
                                                  .EVALUATE_FLAG == 1
                                              ? "care_of_doctor-yellow"
                                              : evaluate.last_data
                                                  .EVALUATE_FLAG == 2
                                              ? "care_of_doctor"
                                              : evaluate.last_data
                                                  .EVALUATE_FLAG == 3
                                              ? "care_of_doctor-red"
                                              : ""
                                          }`
                                    }">
                                        <div class="card_header">
                                          <p><b>สถานะ :</b> ${
                                            evaluate.total > 0
                                              ? "ผ่านการประเมินแล้ว"
                                              : "รอการประเมิน..."
                                          }</p>
                                          <div class="space"></div>
                                          ${
                                            evaluate.total > 0
                                              ? `<div class="qty_evaluate">ประเมินแล้ว ${evaluate.total} ครั้ง</div>`
                                              : ""
                                          }
                                          
                                        </div>
                                        <div class="card_body">
                                          <div class="card_body_left">
                                            <p><b class="no_evaluate">${
                                              evaluate.evaNo
                                            }</b></p>
                                          </div>
                                          <div class="card_body_center">
                                            <p>${evaluate.evaName}</p>
                                            <p>
                                              <i class="fa fa-clock-o" aria-hidden="true"></i> อัพเดทเมื่อ :
                                             ${evaluate.updateDate}
                                             ${
                                               evaluate.last_data
                                                 ? evaluate.last_data.GUID ==
                                                   null
                                                   ? ""
                                                   : '<i class="fa fa-check" aria-hidden="true"></i>'
                                                 : ""
                                             }
                                            </p>
                                          </div>
                                          ${
                                            evaluate.total > 0
                                              ? `<div class="status-card-body-btn-evaluate">
                                          <i class="fa fa-chevron-right"></i>
                                          </div>`
                                              : ""
                                          }
                                          
                                        </div>
                                        ${
                                          evaluate.total > 0
                                            ? ` <div class="card-footer">
                                        <p>คำแนะนำล่าสุด</p>
                                        <div class="space"></div>
                                        <div class="recommend"><p>${
                                          evaluate.evaNo == 2
                                            ? evaluate.recommend
                                            : evaluate.last_data
                                            ? evaluate.last_data.EVALUATE_RESULT
                                            : ""
                                        }</p></div>
                                        </div>`
                                            : ""
                                        }
                                       
                                        </div>
                                        <hr>`).on("click", function () {
                                      switch (index) {
                                        case 0:
                                          gotoEvaPage1(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;

                                        case 1:
                                          gotoEvaPage2(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;

                                        case 2:
                                          gotoEvaPage3(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;

                                        case 3:
                                          gotoEvaPage4(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;

                                        case 4:
                                          gotoEvaPage5(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;

                                        case 5:
                                          gotoEvaPage6(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;

                                        case 6:
                                          gotoEvaPage7(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;
                                        case 7:
                                          gotoEvaPage8(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;
                                        case 8:
                                          gotoEvaPage9(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;
                                        case 9:
                                          gotoEvaPage10(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;
                                        case 10:
                                          gotoEvaPage11(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;
                                        case 11:
                                          gotoEvaPage12(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;
                                        case 12:
                                          gotoEvaPage13(
                                            $(this).attr("lastevalutateid")
                                          );
                                          break;

                                        default:
                                          break;
                                      }
                                    });
                                  });
                                }
                              }
                            );
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
    $(
      "#evaluate_detail_page .list_item_group .visit_card,#evaluate_detail_page .list_item_group .evaluate_card,#evaluate_detail_page .list_item_group hr"
    ).remove();
    // const evaluate = evaluateData[index];
    // console.log(evaluateData);
  }
  function readerAfterSaveEva() {
    $("#evaluate_detail_page .content .evaluate_status_bar span").text(
      " " + $("#evaluate_detail_page ul li span").eq(0).text()
    );
    queryByID(
      "VHV_TR_ELDER",
      evaluate_elder_id,
      function (res) {
        console.log(res);
        if (res.HEALTH_STATUS == 1) {
          console.log("แข็งแรง");
          $("#evaluate_detail_page .content .evaluate_status_bar img").attr(
            "src",
            "img/health_2_icon.png"
          );
          $("#evaluate_detail_page .content .evaluate_status_bar span").text(
            "แข็งแรง"
          );
        } else if (res.HEALTH_STATUS == 2) {
          console.log("พยุงเดิน");
          $("#evaluate_detail_page .content .evaluate_status_bar img").attr(
            "src",
            "img/health_3_icon.png"
          );
          $("#evaluate_detail_page .content .evaluate_status_bar span").text(
            "พยุงเดิน"
          );
        } else if (res.HEALTH_STATUS == 3) {
          console.log("ติดเตียง");
          $("#evaluate_detail_page .content .evaluate_status_bar img").attr(
            "src",
            "img/health_1_icon.png"
          );
          $("#evaluate_detail_page .content .evaluate_status_bar span").text(
            "ติดเตียง"
          );
        } else {
          $("#evaluate_detail_page .content .evaluate_status_bar span").text(
            "ไม่มีข้อมูล"
          );
        }
      }
    );
    $("#evaluate_detail_page .footer .footerbarstatus p")
      .eq(1)
      .text(" " + $("#evaluate_detail_page ul li span").eq(1).text());
  }
  $(".status-card.evaluate").on("click", function () {
   
      evaluate_elder_id =$(`#${$(this).parents('.modal').attr('id')} .status-card`).attr("ELDER_ID")
      console.log(evaluate_elder_id)
      evaluate_from_page=$(this).parent().parent().parent().attr('id')
      console.log(evaluate_from_page)
      reloadEvaluateList();
      loading.show();
      setTimeout(function () {
        loading.hide();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
        });
        // setProgressevaluate(9);
      }, 500);
    
   
  });
  // ปุ่ม back
  $("#evaluate_detail_page .header .back_header_btn").on("click", function () {
    changePage(evaluate_from_page, function () {});
  });
  // chkStatusEva;
  function chkStatusEva() {
    return new Promise((resolve, reject) => {
      let tempStatusEva = [];
      $.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], function (index, dt) {
        queryByELDER_ID(
          "VHV_TR_EVALUATE" + dt,
          evaluate_elder_id,
          function (res) {
            if (res.length > 0) {
              tempStatusEva.push({ data: dt });
            }
            if (dt == 13) {
              resolve(tempStatusEva);
            }
          }
        );
      });
    });
  }
  // chkStatusEvaAll
  function chkStatusEvaAll() {
    chkStatusEva().then(function (res) {
      if (res.length == 13) {
        sqlUpdate(
          "VHV_TR_ELDER",
          { EVALUATE_STATUS: 1, UPDATE_FLAG: 1 },
          evaluate_elder_id,
          function (res) {}
        );
      }
    });
  }
  /* ----------------------------------------------------------------------------- end : evaluate_detail_page ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_1 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_1

  function gotoEvaPage1(lastRecordId) {
    loading.show();
    $(`#evaluate_page_1 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_1 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_1 button.choice").removeClass("active");
    $(
      "#evaluate_page_1 input[type='number'],#evaluate_page_1 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_1 input[type="radio"],#evaluate_page_1 input[type="checkbox"]'
    ).prop("checked", false);
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE1", lastRecordId, function (lastData) {
        $("#DTX").val(lastData.DTX);
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_1", function () {
        $("#DTX").prop("disabled", true);
        $("#evaluate_page_1 .evaluate_page_status ").show();
        $("#evaluate_page_1 .footer").show();
        $("#evaluate_page_1 .step-footer").hide();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_1 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_1 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_1 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
    $("#DTX").prop("disabled", false);
    $("#DTX").focus();
    $("#DTX").val("");
    $("#evaluate_page_1 .evaluate_page_status ").hide();
    $("#evaluate_page_1 .footer").hide();
    $("#evaluate_page_1 .step-footer").show();
  });
  // เช็คค่าใน input
  var EVALUATE_RESULT1;
  $("#DTX").on("change paste keyup", function () {
    if (validateForm([$("#DTX").val()]) && $("#DTX").val().length > 1) {
      if ($("#DTX").val() > 59 && $("#DTX").val() <= 200) {
        $("#evaluate_page_1 .step-footer .btn_group .submit").prop(
          "disabled",
          false
        );
      }else{
        $("#evaluate_page_1 .step-footer .btn_group .submit").prop(
          "disabled",
          true
        );
      }
      let data = setDataEva1();

      evaluateResult(data).then((res) => {
        EVALUATE_RESULT1 = res;
      });
    } else {
      $("#evaluate_page_1 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_1 .evaluate_page_status ").hide();
    }
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_1 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $("#DTX").prop("disabled", true);

      $("#evaluate_page_1 .evaluate_page_status ").show();
      $("#evaluate_page_1 .footer").show();
      $("#evaluate_page_1 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(0).click();
    }
  );
  // ปุ่ม บันทึก

  function setDataEva1() {
    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 1,
      DTX: $("#DTX").val(),
      EVALUATE_FLAG: "",
      EVALUATE_SCORE: $("#DTX").val(),
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_1 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva1();
      console.log(EVALUATE_RESULT1);
      data.EVALUATE_FLAG = EVALUATE_RESULT1.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT1.EVALUATE_RESULT;
      sqlInsert("VHV_TR_EVALUATE1", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );
  /* ----------------------------------------------------------------------------- end : evaluate_page_1 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_2 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_2
  function gotoEvaPage2(lastRecordId) {
    loading.show();
    $(`#evaluate_page_2 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_2 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_2 button.choice").removeClass("active");
    $(
      "#evaluate_page_2 input[type='number'],#evaluate_page_2 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_2 input[type="radio"],#evaluate_page_2 input[type="checkbox"]'
    ).prop("checked", false);
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE2", lastRecordId, function (lastData) {
        $("#blood_pressure_up").val(lastData.SBP);
        $("#blood_pressure_down").val(lastData.DBP);
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();

      changePage("evaluate_page_2", function () {
        $("#blood_pressure_up").prop("disabled", true);
        $("#blood_pressure_down").prop("disabled", true);
        $("#evaluate_page_2 .evaluate_page_status ").show();
        $("#evaluate_page_2 .footer").show();
        $("#evaluate_page_2 .step-footer").hide();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_2 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_2 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_2 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
    $("#blood_pressure_up").prop("disabled", false);
    $("#blood_pressure_down").prop("disabled", false);
    $("#blood_pressure_up").focus();
    $("#blood_pressure_up").val("");
    $("#blood_pressure_down").val("");
    $("#evaluate_page_2 .evaluate_page_status ").hide();
    $("#evaluate_page_2 .footer").hide();
    $("#evaluate_page_2 .step-footer").show();
  });
  // เช็คค่าใน input
  $("#blood_pressure_up,#blood_pressure_down").on(
    "change paste keyup",
    function () {
      if (
        validateForm([
          $("#blood_pressure_up").val(),
          $("#blood_pressure_down").val(),
        ])
      ) {
        if(  0<$("#blood_pressure_up").val()&&$("#blood_pressure_up").val()<=300&& 0<$("#blood_pressure_down").val()&&$("#blood_pressure_down").val()<=160){
          $("#evaluate_page_2 .step-footer .btn_group .submit").prop(
            "disabled",
            false
          );
        }else{
          $("#evaluate_page_2 .step-footer .btn_group .submit").prop(
            "disabled",
            true
          );
        }
        let data = setDataEva2();
        evaluateResult(data).then((res) => {
          EVALUATE_RESULT2 = res;
        });
      } else {
        $("#evaluate_page_2 .step-footer .btn_group .submit").prop(
          "disabled",
          true
        );
        $("#evaluate_page_2 .evaluate_page_status ").hide();
      }
    }
  );
  // เช็คค่าใน input

  // ปุ่ม ยกเลิก
  $("#evaluate_page_2 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $("#blood_pressure_up").prop("disabled", true);
      $("#blood_pressure_down").prop("disabled", true);
      $("#evaluate_page_2 .evaluate_page_status ").show();
      $("#evaluate_page_2 .footer").show();
      $("#evaluate_page_2 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(1).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva2() {
    return {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 2,
      SBP: $("#blood_pressure_up").val(),
      DBP: $("#blood_pressure_down").val(),
      FLAGSBP: 1,
      RESULTSBP: "",
      SCORESBP: $("#blood_pressure_up").val(),
      FLAGDBP: 1,
      RESULTDBP: "",
      SCOREDBP: $("#blood_pressure_down").val(),
    };
  }
  $("#evaluate_page_2 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva2();
      (data.FLAGSBP = EVALUATE_RESULT2.RESULTSBP.EVALUATE_FLAG),
        (data.RESULTSBP = EVALUATE_RESULT2.RESULTSBP.EVALUATE_RESULT),
        (data.FLAGDBP = EVALUATE_RESULT2.RESULTDBP.EVALUATE_FLAG),
        (data.RESULTDBP = EVALUATE_RESULT2.RESULTDBP.EVALUATE_RESULT),
        sqlInsert("VHV_TR_EVALUATE2", data, function (inserted_id) {
          console.log(inserted_id);
          chkStatusEvaAll();
          reloadEvaluateList();
          $("#evaluate_detail_page .footer.evaluate-success").show();
          changePage("evaluate_detail_page", function () {
            readerAfterSaveEva();
            setTimeout(function () {
              $("#evaluate_detail_page .footer.evaluate-success").hide();
            }, 1000);
          });
        });
    }
  );
  /* ----------------------------------------------------------------------------- end : evaluate_page_2 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_3 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_3
  function gotoEvaPage3(lastRecordId) {
    loading.show();
    $(`#evaluate_page_3 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_3 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_3 button.choice").removeClass("active");
    $(
      "#evaluate_page_3 input[type='number'],#evaluate_page_3 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_3 input[type="radio"],#evaluate_page_3 input[type="checkbox"]'
    ).prop("checked", false);
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE3", lastRecordId, function (lastData) {
        $(`#CVD1 .choice[value="${parseInt(lastData.CVD1)}"]`).addClass(
          "active"
        );
        $(`#CVD2 .choice[value="${parseInt(lastData.CVD2)}"]`).addClass(
          "active"
        );
        $(`#CVD3 .choice[value="${parseInt(lastData.CVD3)}"]`).addClass(
          "active"
        );
        $(`#CVD4 .choice[value="${parseInt(lastData.CVD4)}"]`).addClass(
          "active"
        );
        $(`#CVD5 .choice[value="${parseInt(lastData.CVD5)}"]`).addClass(
          "active"
        );
        $(`#CVD6 .choice[value="${parseInt(lastData.CVD6)}"]`).addClass(
          "active"
        );
        $(`#CVD7 .choice[value="${parseInt(lastData.CVD7)}"]`).addClass(
          "active"
        );
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_3", function () {
        $("#evaluate_page_3 button.choice").prop("disabled", true);
        $("#evaluate_page_3 .evaluate_page_status ").show();
        $("#evaluate_page_3 .footer").show();
        $("#evaluate_page_3 .step-footer").hide();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_3 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_3 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_3 button.choice").prop("disabled", false);
    $("#evaluate_page_3 button.choice").removeClass("active");
    $("#evaluate_page_3 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
    $("#evaluate_page_3 .evaluate_page_status ").hide();
    $("#evaluate_page_3 .footer").hide();
    $("#evaluate_page_3 .step-footer").show();
  });
  $("#evaluate_page_3 button.choice").on("click", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });
  // เช็คค่าในแบบประเมินเพื่อเปิดปุ่มบันทึก
  let EVALUATE_RESULT3;
  $("#evaluate_page_3 .btn-group button").on("click", function () {
    if (
      validateForm([
        $("#CVD1 button.choice.active").val(),
        $("#CVD2 button.choice.active").val(),
        $("#CVD3 button.choice.active").val(),
        $("#CVD4 button.choice.active").val(),
        $("#CVD5 button.choice.active").val(),
        $("#CVD6 button.choice.active").val(),
        $("#CVD7 button.choice.active").val(),
      ])
    ) {
      let data = setDataEva3();

      evaluateResult(data).then((res) => {
        EVALUATE_RESULT3 = res;
      });
      $("#evaluate_page_3 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
    } else {
      $("#evaluate_page_3 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_3 .evaluate_page_status ").hide();
    }
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_3 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $("#evaluate_page_3 button.choice").prop("disabled", true);
      $("#evaluate_page_3 .evaluate_page_status ").show();
      $("#evaluate_page_3 .footer").show();
      $("#evaluate_page_3 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(2).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva3() {
    let CVD1 = parseInt($("#CVD1 .choice.active").val());
    let CVD2 = parseInt($("#CVD2 .choice.active").val());
    let CVD3 = parseInt($("#CVD3 .choice.active").val());
    let CVD4 = parseInt($("#CVD4 .choice.active").val());
    let CVD5 = parseInt($("#CVD5 .choice.active").val());
    let CVD6 = parseInt($("#CVD6 .choice.active").val());
    let CVD7 = parseInt($("#CVD7 .choice.active").val());
    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 3,
      CVD1: CVD1,
      CVD2: CVD2,
      CVD3: CVD3,
      CVD4: CVD4,
      CVD5: CVD5,
      CVD6: CVD6,
      CVD7: CVD7,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE: CVD1 + CVD2 + CVD3 + CVD4 + CVD5 + CVD6 + CVD7,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_3 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva3();
      data.EVALUATE_FLAG = EVALUATE_RESULT3.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT3.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE3", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );

  /* ----------------------------------------------------------------------------- end : evaluate_page_3 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_4 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_4
  function gotoEvaPage4(lastRecordId) {
    loading.show();
    $(`#evaluate_page_4 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_4 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_4 button.choice").removeClass("active");
    $(
      "#evaluate_page_4 input[type='number'],#evaluate_page_3 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_4 input[type="radio"],#evaluate_page_3 input[type="checkbox"]'
    ).prop("checked", false);
    $(`#COG2A`).prop("checked", false);
    $(`#COG2B`).prop("checked", false);
    $(`#COG2C`).prop("checked", false);
    $(`#evaluate_page_4 .image_upload_preview img`).removeAttr("src");
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE4", lastRecordId, function (lastData) {
        $(`#COG1A .choice[value="${parseInt(lastData.COG1A)}"]`).addClass(
          "active"
        );

        $(`#COG1B .choice[value="${parseInt(lastData.COG1B)}"]`).addClass(
          "active"
        );
        $(`#evaluate_page_4 .image_upload_preview img`).attr(
          "src",
          lastData.COG1C_PIC
        );
        $(`#COG2A`).prop("checked", lastData.COG2A == 1 ? true : false);
        $(`#COG2B`).prop("checked", lastData.COG2B == 1 ? true : false);
        $(`#COG2C`).prop("checked", lastData.COG2C == 1 ? true : false);
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_4", function () {
        checkImg();
        $("#evaluate_page_4 .step-footer .btn_group .submit").prop(
          "disabled",
          true
        );
        $(".image_upload_preview").attr("disabled", "disabled");

        $("button.camera").hide();

        $("#evaluate_page_4 input[type='checkbox']").prop("disabled", true);
        $("#evaluate_page_4 button.choice").prop("disabled", true);
        $("#evaluate_page_4 .step-footer").hide();

        $("#evaluate_page_4 .evaluate_page_status ").show();
        $("#evaluate_page_4 .footer.evaluate_page_footer ").show();
      });
    }, 500);
  }
  //add img
  $("button.camera").on("click", function () {
    showModal("modal-img-eva4");
  });
  $("#evaluate_page_4 .on_camera").on("click", function () {
    navigator.camera.getPicture(
      function (res) {
        $(".image_upload_preview img").attr(
          "src",
          `data:image/png;base64,${res}`
        );
        checkImg();
        vaildateFormEva4();
        $(".modal-dismiss").click();
      },
      function (err) {},
      {
        destinationType: Camera.DestinationType.DATA_URL,
      }
    );
  });
  $("#evaluate_page_4 .on_gallery").on("click", function () {
    $("#on_gallery").click();
    // $(".image_upload_preview img").attr('src',"img/1.jpg");
  });
  $("#on_gallery").change(function () {
    readURL(this);
  });
  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $(".image_upload_preview img").attr("src", e.target.result);
        checkImg();
        $(".modal-dismiss").click();
        vaildateFormEva4();
      };
      reader.readAsDataURL(input.files[0]);
    } else {
      alert("select a file to see preview");
      $(".image_upload_preview img").removeAttr("src");
    }
  }

  //remove img

  $(".image_upload_preview .dismiss").on("click", function () {
    if ($(".image_upload_preview").attr("disabled") == "disabled") {
      return false;
    } else {
      $(".image_upload_preview img").removeAttr("src");
      $(".image_upload_preview").hide();
      $("button.camera").show();
    }
  });
  // ปุ่ม back
  $("#evaluate_page_4 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_4 .footer .btn_create_evaluate").on("click", function () {
    $(`#COG1A .choice`).removeClass("active");
    $(`#COG1B .choice`).removeClass("active");
    $(".image_upload_preview img").removeAttr("src");
    $(".image_upload_preview").hide();
    $("button.camera").show();
    $(`#COG2A`).prop("checked", false);
    $(`#COG2B`).prop("checked", false);
    $(`#COG2C`).prop("checked", false);
    $("#evaluate_page_4 input[type='checkbox']").prop("disabled", false);
    $("#evaluate_page_4 input[type='radio']").prop("disabled", false);
    $("#evaluate_page_4 button.choice").prop("disabled", false);
    $(".image_upload_preview").removeAttr("disabled");
    checkImg();
    $("#evaluate_page_4 .evaluate_page_status ").hide();
    $("#evaluate_page_4 .footer").hide();
    $("#evaluate_page_4 .step-footer").show();
  });
  $("#evaluate_page_4 button.choice").on("click", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });
  // เช็คค่าในแบบประเมินเพื่อเปิดปุ่มบันทึก
  $(
    "#evaluate_page_4 .btn-group button,#evaluate_page_4 input[type='checkbox']"
  ).on("click", function () {
    vaildateFormEva4();
  });
  let EVALUATE_RESULT4;
  function vaildateFormEva4() {
    if (
      validateForm([
        $("#COG1A .choice.active").val(),
        $("#COG1B .choice.active").val(),
        $("#evaluate_page_4 .image_upload_preview img").attr("src"),
      ])
    ) {
      $("#evaluate_page_4 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
      let data = setDataEva4();
      evaluateResult(data).then((res) => {
        EVALUATE_RESULT4 = res;
      });
    } else {
      $("#evaluate_page_4 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_4 .evaluate_page_status ").hide();
    }
  }
  $(".image_upload_preview img").click(function () {
    var src = $(this).attr("src");
    var modal;

    function removeModal() {
      modal.remove();
      $("body").off("keyup.modal-close");
    }
    modal = $("<div>")
      .css({
        background: "RGBA(0,0,0,1) url(" + src + ") no-repeat center",
        backgroundSize: "contain",
        width: "100%",
        height: "100%",
        position: "fixed",
        zIndex: "10000",
        top: "0",
        left: "0",
        cursor: "zoom-out",
      })
      .click(function () {
        removeModal();
      })
      .appendTo("body");
    //handling ESC
    $("body").on("keyup.modal-close", function (e) {
      if (e.key === "Escape") {
        removeModal();
      }
    });
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_4 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $(".image_upload_preview").attr("disabled", "disabled");
      $("#evaluate_page_4 input[type='checkbox']").prop("disabled", true);
      $("#evaluate_page_4 button.choice").prop("disabled", true);
      $("#evaluate_page_4 .evaluate_page_status ").show();
      $("#evaluate_page_4 .footer").show();
      $("#evaluate_page_4 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(3).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva4() {
    let COG1A = parseInt($("#COG1A .choice.active").val());
    let COG1B = parseInt($("#COG1B .choice.active").val());
    let COG1C_PIC = $("#evaluate_page_4 .image_upload_preview img").prop("src");
    let COG2A = $("#COG2A").prop("checked") ? 1 : 0;
    let COG2B = $("#COG2B").prop("checked") ? 1 : 0;
    let COG2C = $("#COG2C").prop("checked") ? 1 : 0;
    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 4,
      COG1A: COG1A,
      COG1B: COG1B,
      COG1C_PIC: COG1C_PIC,
      COG2A: COG2A,
      COG2B: COG2B,
      COG2C: COG2C,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE: COG1A + COG1B + COG2A + COG2B + COG2C,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_4 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva4();
      data.EVALUATE_FLAG = EVALUATE_RESULT4.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT4.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE4", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );
  /* ----------------------------------------------------------------------------- end : evaluate_page_4 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_5 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_5
  function gotoEvaPage5(lastRecordId) {
    loading.show();
    $(`#evaluate_page_5 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_5 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_5 button.choice").removeClass("active");
    $(
      "#evaluate_page_5 input[type='number'],#evaluate_page_5 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_5 input[type="radio"],#evaluate_page_5 input[type="checkbox"]'
    ).prop("checked", false);
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE5", lastRecordId, function (lastData) {
        $(`#P2Q1 .choice[value="${parseInt(lastData.P2Q1)}"]`).addClass(
          "active"
        );
        $(`#P2Q2 .choice[value="${parseInt(lastData.P2Q2)}"]`).addClass(
          "active"
        );
        $(`input[name="P9Q1"][value="${parseInt(lastData.P9Q1)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="P9Q2"][value="${parseInt(lastData.P9Q2)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="P9Q3"][value="${parseInt(lastData.P9Q3)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="P9Q4"][value="${parseInt(lastData.P9Q4)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="P9Q5"][value="${parseInt(lastData.P9Q5)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="P9Q6"][value="${parseInt(lastData.P9Q6)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="P9Q7"][value="${parseInt(lastData.P9Q7)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="P9Q8"][value="${parseInt(lastData.P9Q8)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="P9Q9"][value="${parseInt(lastData.P9Q9)}"]`).prop(
          "checked",
          true
        );
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_5", function () {
        $('#evaluate_page_5 input[type="radio"]').prop("disabled", true);

        $("#evaluate_page_5 button.choice").prop("disabled", true);
        $("#evaluate_page_5 .evaluate_page_status ").show();
        $("#evaluate_page_5 .footer").show();
        $("#evaluate_page_5 .step-footer").hide();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_5 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_5 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_5 button.choice").prop("disabled", false);
    $('#evaluate_page_5 input[type="radio"]').prop("disabled", false);
    $('#evaluate_page_5 input[type="radio"]').prop("checked", false);
    $("#evaluate_page_5 button.choice").removeClass("active");
    $("#evaluate_page_5 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
    $("#evaluate_page_5 .evaluate_page_status ").hide();
    $("#evaluate_page_5 .footer").hide();
    $("#evaluate_page_5 .step-footer").show();
  });
  $("#evaluate_page_5 button.choice").on("click", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });
  // เช็คค่าในแบบประเมินเพื่อเปิดปุ่มบันทึก
  let EVALUATE_RESULT5;
  $(
    "#evaluate_page_5 .btn-group button,#evaluate_page_5 input[type='radio']"
  ).on("click", function () {
    let P2Q1 = $("#P2Q1 .choice.active").val();
    let P2Q2 = $("#P2Q2 .choice.active").val();
    let P9Q1 = $('input[name="P9Q1"]:checked').val();
    let P9Q2 = $('input[name="P9Q2"]:checked').val();
    let P9Q3 = $('input[name="P9Q3"]:checked').val();
    let P9Q4 = $('input[name="P9Q4"]:checked').val();
    let P9Q5 = $('input[name="P9Q5"]:checked').val();
    let P9Q6 = $('input[name="P9Q6"]:checked').val();
    let P9Q7 = $('input[name="P9Q7"]:checked').val();
    let P9Q8 = $('input[name="P9Q8"]:checked').val();
    let P9Q9 = $('input[name="P9Q9"]:checked').val();

    if (
      validateForm([
        P2Q1,
        P2Q2,
        P9Q1,
        P9Q2,
        P9Q3,
        P9Q4,
        P9Q5,
        P9Q6,
        P9Q7,
        P9Q8,
        P9Q9,
      ])
    ) {
      $("#evaluate_page_5 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
      let data = setDataEva5();
      evaluateResult(data).then((res) => {
        EVALUATE_RESULT5 = res;
      });
    } else {
      $("#evaluate_page_5 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_5 .evaluate_page_status ").hide();
    }
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_5 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $('#evaluate_page_5 input[type="radio"]').prop("disabled", true);
      $("#evaluate_page_5 button.choice").prop("disabled", true);
      $("#evaluate_page_5 .evaluate_page_status ").show();
      $("#evaluate_page_5 .footer").show();
      $("#evaluate_page_5 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(4).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva5() {
    let P2Q1 = parseInt($("#P2Q1 .choice.active").val());
    let P2Q2 = parseInt($("#P2Q2 .choice.active").val());
    let P9Q1 = parseInt($('input[name="P9Q1"]:checked').val());
    let P9Q2 = parseInt($('input[name="P9Q2"]:checked').val());
    let P9Q3 = parseInt($('input[name="P9Q3"]:checked').val());
    let P9Q4 = parseInt($('input[name="P9Q4"]:checked').val());
    let P9Q5 = parseInt($('input[name="P9Q5"]:checked').val());
    let P9Q6 = parseInt($('input[name="P9Q6"]:checked').val());
    let P9Q7 = parseInt($('input[name="P9Q7"]:checked').val());
    let P9Q8 = parseInt($('input[name="P9Q8"]:checked').val());
    let P9Q9 = parseInt($('input[name="P9Q9"]:checked').val());
    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 5,
      P2Q1: P2Q1,
      P2Q2: P2Q2,
      P9Q1: P9Q1,
      P9Q2: P9Q2,
      P9Q3: P9Q3,
      P9Q4: P9Q4,
      P9Q5: P9Q5,
      P9Q6: P9Q6,
      P9Q7: P9Q7,
      P9Q8: P9Q8,
      P9Q9: P9Q9,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE:
        P2Q1 +
        P2Q2 +
        P9Q1 +
        P9Q2 +
        P9Q3 +
        P9Q4 +
        P9Q5 +
        P9Q6 +
        P9Q7 +
        P9Q8 +
        P9Q9,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_5 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva5();
      data.EVALUATE_FLAG = EVALUATE_RESULT5.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT5.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE5", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );
  /* ----------------------------------------------------------------------------- end : evaluate_page_5 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_6 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_6
  function gotoEvaPage6(lastRecordId) {
    loading.show();
    $(`#evaluate_page_6 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_6 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_6 button.choice").removeClass("active");
    $(
      "#evaluate_page_6 input[type='number'],#evaluate_page_6 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_6 input[type="radio"],#evaluate_page_6 input[type="checkbox"]'
    ).prop("checked", false);
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE6", lastRecordId, function (lastData) {
        $(`#OST1 .choice[value="${parseInt(lastData.OST1)}"]`).addClass(
          "active"
        );
        $(`#OST2 .choice[value="${parseInt(lastData.OST2)}"]`).addClass(
          "active"
        );
        $(`#OST3 .choice[value="${parseInt(lastData.OST3)}"]`).addClass(
          "active"
        );
        $(`#OST4 .choice[value="${parseInt(lastData.OST4)}"]`).addClass(
          "active"
        );
        $(`#OST5 .choice[value="${parseInt(lastData.OST5)}"]`).addClass(
          "active"
        );
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_6", function () {
        $("#evaluate_page_6 button.choice").prop("disabled", true);
        $("#evaluate_page_6 .step-footer").hide();
        $("#evaluate_page_6 .evaluate_page_status ").show();
        $("#evaluate_page_6 .footer.evaluate_page_footer ").show();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_6 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_6 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_6 button.choice").prop("disabled", false);
    $("#evaluate_page_6 button.choice").removeClass("active");
    $("#evaluate_page_6 .evaluate_page_status ").hide();
    $("#evaluate_page_6 .footer").hide();
    $("#evaluate_page_6 .step-footer").show();
    $("#evaluate_page_6 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
  });
  $("#evaluate_page_6 button.choice").on("click", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });
  // เช็คค่าในแบบประเมินเพื่อเปิดปุ่มบันทึก
  let EVALUATE_RESULT6;
  $("#evaluate_page_6 .btn-group button").on("click", function () {
    let OST1 = $("#OST1 .choice.active").val();
    let OST2 = $("#OST2 .choice.active").val();
    let OST3 = $("#OST3 .choice.active").val();
    let OST4 = $("#OST4 .choice.active").val();
    let OST5 = $("#OST5 .choice.active").val();
    if (validateForm([OST1, OST2, OST3, OST4, OST5])) {
      $("#evaluate_page_6 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
      let data = setDataEva6();
      evaluateResult(data).then((res) => {
        EVALUATE_RESULT6 = res;
      });
    } else {
      $("#evaluate_page_6 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_6 .evaluate_page_status ").hide();
    }
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_6 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $("#evaluate_page_6 button.choice").prop("disabled", true);
      $("#evaluate_page_6 .evaluate_page_status ").show();
      $("#evaluate_page_6 .footer").show();
      $("#evaluate_page_6 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(5).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva6() {
    let OST1 = parseInt($("#OST1 .choice.active").val());
    let OST2 = parseInt($("#OST2 .choice.active").val());
    let OST3 = parseInt($("#OST3 .choice.active").val());
    let OST4 = parseInt($("#OST4 .choice.active").val());
    let OST5 = parseInt($("#OST5 .choice.active").val());
    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 6,
      OST1: OST1,
      OST2: OST2,
      OST3: OST3,
      OST4: OST4,
      OST5: OST5,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE: OST1 + OST2 + OST3 + OST4 + OST5,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_6 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva6();
      data.EVALUATE_FLAG = EVALUATE_RESULT6.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT6.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE6", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );
  /* ----------------------------------------------------------------------------- end : evaluate_page_6 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_7 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_7
  function gotoEvaPage7(lastRecordId) {
    loading.show();
    $(`#evaluate_page_7 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_7 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_7 button.choice").removeClass("active");
    $(
      "#evaluate_page_7 input[type='number'],#evaluate_page_7 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_7 input[type="radio"],#evaluate_page_7 input[type="checkbox"]'
    ).prop("checked", false);
    $("#evaluate_page_7 .time p").text(pad(0, 2));
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE7", lastRecordId, function (lastData) {
        $("#evaluate_page_7 .time p").text(pad(lastData.TUG, 2));
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_7", function () {
        $("#evaluate_page_7 .run_time button.btn_reset").prop("disabled", true);
        $("#evaluate_page_7 .run_time button.play_stop").prop("disabled", true);
        $("#evaluate_page_7 .step-footer").hide();
        $("#evaluate_page_7 .evaluate_page_status ").show();
        $("#evaluate_page_7 .footer.evaluate_page_footer ").show();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_7 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_7 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_7 .run_time button.play_stop").prop("disabled", false);
    $("#evaluate_page_7 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
    $("#evaluate_page_7 .time p").text("00");
    $("#evaluate_page_7 .evaluate_page_status ").hide();
    $("#evaluate_page_7 .footer").hide();
    $("#evaluate_page_7 .step-footer").show();
  });
  // ปุ่ม เริ่มนับเวลา
  let EVALUATE_RESULT7;
  $("#evaluate_page_7 .run_time button.play_stop").on("click", function () {
    if ($("#evaluate_page_7 .run_time button.play_stop").hasClass("active")) {
      $("#evaluate_page_7 .run_time button.play_stop").removeClass("active");
      $("#evaluate_page_7 .run_time button.btn_reset").prop("disabled", false);
      $("#evaluate_page_7 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
      $("#evaluate_page_7 .step-footer .btn_group .cancel").prop(
        "disabled",
        false
      );
      runTimeEva_7(true);
    } else {
      $("#evaluate_page_7 .run_time button.btn_reset").prop("disabled", true);
      $("#evaluate_page_7 .run_time button.play_stop").addClass("active");
      $("#evaluate_page_7 .run_time .time").addClass("active");
      runTimeEva_7(false);
      $("#evaluate_page_7 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );

      $("#evaluate_page_7 .step-footer .btn_group .cancel").prop(
        "disabled",
        true
      );
    }
    let data = setDataEva7();
    evaluateResult(data).then((res) => {
      EVALUATE_RESULT7 = res;
    });
  });
  // ปุ่ม รีเซ็ต
  $("#evaluate_page_7 .run_time button.btn_reset").on("click", function () {
    _timeEva7 = "00";
    _countEva7 = 0;
    runTimeEva_7(true);
    $("#evaluate_page_7 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
    let data = setDataEva7();
    evaluateResult(data).then((res) => {
      EVALUATE_RESULT7 = res;
    });
    $("#evaluate_page_7 .run_time button.play_stop").removeClass("active");
    $("#evaluate_page_7 .run_time .time").removeClass("active");
    $("#evaluate_page_7 .run_time button.btn_reset").prop("disabled", true);
    $("#evaluate_page_7 .run_time .time p").text(_timeEva7);
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_7 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      _timeEva7 = "00";
      _countEva7 = 0;
      runTimeEva_7(true);
      $("#evaluate_page_7 .run_time button.play_stop").removeClass("active");
      $("#evaluate_page_7 .run_time .time").removeClass("active");
      $("#evaluate_page_7 .run_time button.btn_reset").prop("disabled", true);
      $("#evaluate_page_7 .run_time button.play_stop").prop("disabled", true);
      $("#evaluate_page_7 .step-footer").hide();
      $("#evaluate_page_7 .evaluate_page_status ").show();
      $("#evaluate_page_7 .footer.evaluate_page_footer ").show();
      $("#evaluate_detail_page .evaluate_card").eq(6).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva7() {
    let TUG = parseInt($("#evaluate_page_7 .time p").text());
    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 7,
      TUG: TUG,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE: TUG,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_7 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva7();
      data.EVALUATE_FLAG = EVALUATE_RESULT7.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT7.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE7", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );
  var _addIntervalTimeEva7;
  var _timeEva7 = "00";
  var _countEva7 = 0;
  function runTimeEva_7(stop) {
    if (stop) {
      clearInterval(_addIntervalTimeEva7);
    } else {
      _addIntervalTimeEva7 = setInterval(function () {
        _countEva7++;
        let data = setDataEva7();
        evaluateResult(data).then((res) => {});
        if (_countEva7 == 180) {
          clearInterval(_addIntervalTimeEva7);
        }
        if (_countEva7 < 10) {
          _timeEva7 = "0" + _countEva7;
        } else {
          _timeEva7 = _countEva7.toString();
        }
        $("#evaluate_page_7 .run_time .time p").text(_timeEva7);
      }, 1000);
    }
  }
  /* ----------------------------------------------------------------------------- end : evaluate_page_7 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_8 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_8
  function gotoEvaPage8(lastRecordId) {
    loading.show();
    $(`#evaluate_page_8 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_8 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_8 button.choice").removeClass("active");
    $(
      "#evaluate_page_8 input[type='number'],#evaluate_page_8 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_8 input[type="radio"],#evaluate_page_8 input[type="checkbox"]'
    ).prop("checked", false);
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE8", lastRecordId, function (lastData) {
        $(`#EYE1 .choice[value="${parseInt(lastData.EYE1)}"]`).addClass(
          "active"
        );
        $(`#EYE2 .choice[value="${parseInt(lastData.EYE2)}"]`).addClass(
          "active"
        );
        $(`#EYE3L .choice[value="${parseInt(lastData.EYE3L)}"]`).addClass(
          "active"
        );
        $(`#EYE3R .choice[value="${parseInt(lastData.EYE3R)}"]`).addClass(
          "active"
        );
        $(`#EYE4L .choice[value="${parseInt(lastData.EYE4L)}"]`).addClass(
          "active"
        );
        $(`#EYE4R .choice[value="${parseInt(lastData.EYE4R)}"]`).addClass(
          "active"
        );
        $(`#EYE5L .choice[value="${parseInt(lastData.EYE5L)}"]`).addClass(
          "active"
        );
        $(`#EYE5R .choice[value="${parseInt(lastData.EYE5R)}"]`).addClass(
          "active"
        );
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_8", function () {
        $("#evaluate_page_8 button.choice").prop("disabled", true);
        $("#evaluate_page_8 .step-footer").hide();
        $("#evaluate_page_8 .evaluate_page_status ").show();
        $("#evaluate_page_8 .footer.evaluate_page_footer ").show();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_8 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_8 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_8 button.choice").prop("disabled", false);
    $("#evaluate_page_8 button.choice").removeClass("active");
    $("#evaluate_page_8 .evaluate_page_status ").hide();
    $("#evaluate_page_8 .footer").hide();
    $("#evaluate_page_8 .step-footer").show();
    $("#evaluate_page_8 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
  });
  $("#evaluate_page_8 button.choice").on("click", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });
  // เช็คค่าในแบบประเมินเพื่อเปิดปุ่มบันทึก
  let EVALUATE_RESULT8;
  $("#evaluate_page_8 .btn-group button").on("click", function () {
    let EYE1 = $("#EYE1 .choice.active").val();
    let EYE2 = $("#EYE2 .choice.active").val();
    let EYE3L = $("#EYE3L .choice.active").val();
    let EYE3R = $("#EYE3R .choice.active").val();
    let EYE4L = $("#EYE4L .choice.active").val();
    let EYE4R = $("#EYE4R .choice.active").val();
    let EYE5L = $("#EYE5L .choice.active").val();
    let EYE5R = $("#EYE5R .choice.active").val();

    if (validateForm([EYE1, EYE2, EYE3L, EYE3R, EYE4L, EYE4R, EYE5L, EYE5R])) {
      $("#evaluate_page_8 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
      let data = setDataEva8();
      evaluateResult(data).then((res) => {
        EVALUATE_RESULT8 = res;
      });
    } else {
      $("#evaluate_page_8 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_8 .evaluate_page_status ").hide();
    }
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_8 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $("#evaluate_page_8 button.choice").prop("disabled", true);
      $("#evaluate_page_8 .evaluate_page_status ").show();
      $("#evaluate_page_8 .footer").show();
      $("#evaluate_page_8 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(7).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva8() {
    let EYE1 = parseInt($("#EYE1 .choice.active").val());
    let EYE2 = parseInt($("#EYE2 .choice.active").val());
    let EYE3L = parseInt($("#EYE3L .choice.active").val());
    let EYE3R = parseInt($("#EYE3R .choice.active").val());
    let EYE4L = parseInt($("#EYE4L .choice.active").val());
    let EYE4R = parseInt($("#EYE4R .choice.active").val());
    let EYE5L = parseInt($("#EYE5L .choice.active").val());
    let EYE5R = parseInt($("#EYE5R .choice.active").val());
    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 8,
      EYE1: EYE1,
      EYE2: EYE2,
      EYE3L: EYE3L,
      EYE3R: EYE3R,
      EYE4L: EYE4L,
      EYE4R: EYE4R,
      EYE5L: EYE5L,
      EYE5R: EYE5R,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE:
        EYE1 + EYE2 + EYE3L + EYE3R + EYE4L + EYE4R + EYE5L + EYE5R,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_8 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva8();
      data.EVALUATE_FLAG = EVALUATE_RESULT8.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT8.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE8", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").fadeIn(1000);
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").fadeOut(1000);
          }, 2000);
        });
      });
    }
  );
  /* ----------------------------------------------------------------------------- end : evaluate_page_8 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_9 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_9
  function gotoEvaPage9(lastRecordId) {
    loading.show();
    $(`#evaluate_page_9 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_9 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_9 button.choice").removeClass("active");
    $(
      "#evaluate_page_9 input[type='number'],#evaluate_page_9 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_9 input[type="radio"],#evaluate_page_9 input[type="checkbox"]'
    ).prop("checked", false);
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE9", lastRecordId, function (lastData) {
        $(`#RUBR .choice[value="${parseInt(lastData.RUBR)}"]`).addClass(
          "active"
        );
        $(`#RUBL .choice[value="${parseInt(lastData.RUBL)}"]`).addClass(
          "active"
        );
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_9", function () {
        $("#evaluate_page_9 button.choice").prop("disabled", true);
        $("#evaluate_page_9 .step-footer").hide();
        $("#evaluate_page_9 .evaluate_page_status ").show();
        $("#evaluate_page_9 .footer.evaluate_page_footer ").show();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_9 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_9 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_9 button.choice").prop("disabled", false);
    $("#evaluate_page_9 button.choice").removeClass("active");
    $("#evaluate_page_9 .evaluate_page_status ").hide();
    $("#evaluate_page_9 .footer").hide();
    $("#evaluate_page_9 .step-footer").show();
    $("#evaluate_page_9 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
  });
  $("#evaluate_page_9 button.choice").on("click", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });
  // เช็คค่าในแบบประเมินเพื่อเปิดปุ่มบันทึก
  let EVALUATE_RESULT9;
  $("#evaluate_page_9 .btn-group button").on("click", function () {
    let RUBL = $("#RUBL .choice.active").val();
    let RUBR = $("#RUBR .choice.active").val();
    if (validateForm([RUBL, RUBR])) {
      $("#evaluate_page_9 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
      let data = setDataEva9();
      evaluateResult(data).then((res) => {
        EVALUATE_RESULT9 = res;
      });
    } else {
      $("#evaluate_page_9 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_9 .evaluate_page_status ").hide();
    }
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_9 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $("#evaluate_page_9 button.choice").prop("disabled", true);
      $("#evaluate_page_9 .evaluate_page_status ").show();
      $("#evaluate_page_9 .footer").show();
      $("#evaluate_page_9 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(8).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva9() {
    let RUBL = parseInt($("#RUBL .choice.active").val());
    let RUBR = parseInt($("#RUBR .choice.active").val());

    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 9,
      RUBL: RUBL,
      RUBR: RUBR,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE: RUBL + RUBR,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_9 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva9();
      data.EVALUATE_FLAG = EVALUATE_RESULT9.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT9.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE9", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );
  /* ----------------------------------------------------------------------------- end : evaluate_page_9 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_10 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_10
  function gotoEvaPage10(lastRecordId) {
    loading.show();
    $(`#evaluate_page_10 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_10 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_10 button.choice").removeClass("active");
    $(
      "#evaluate_page_10 input[type='number'],#evaluate_page_10 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_10 input[type="radio"],#evaluate_page_10 input[type="checkbox"]'
    ).prop("checked", false);
    $("#eva10_sub_1").hide();
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE10", lastRecordId, function (lastData) {
        if (
          parseFloat(lastData.OSR1A) +
            parseFloat(lastData.OSR1B) +
            parseFloat(lastData.OSR1C) +
            parseFloat(lastData.OSR1D) >
          0
        ) {
          $(`#OSR1 .choice[value="1"]`).addClass("active");
          $("#eva10_sub_1").show();
        } else {
          $(`#OSR1 .choice[value="0"]`).addClass("active");
          $("#eva10_sub_1").hide();
        }

        $(`#OSR1A .choice[value="${parseInt(lastData.OSR1A)}"]`).addClass(
          "active"
        );
        $(`#OSR1B .choice[value="${parseInt(lastData.OSR1B)}"]`).addClass(
          "active"
        );
        $(`#OSR1C .choice[value="${parseInt(lastData.OSR1C)}"]`).addClass(
          "active"
        );
        $(`#OSR1D .choice[value="${parseInt(lastData.OSR1D)}"]`).addClass(
          "active"
        );
        $(`#OSR2 .choice[value="${parseInt(lastData.OSR2)}"]`).addClass(
          "active"
        );
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_10", function () {
        $("#evaluate_page_10 button.choice").prop("disabled", true);
        $("#evaluate_page_10 .step-footer").hide();
        $("#evaluate_page_10 .evaluate_page_status ").show();
        $("#evaluate_page_10 .footer.evaluate_page_footer ").show();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_10 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_10 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_10 button.choice").prop("disabled", false);
    $("#eva10_sub_1").hide();
    $("#evaluate_page_10 button.choice").removeClass("active");
    $("#evaluate_page_10 .evaluate_page_status ").hide();
    $("#evaluate_page_10 .footer").hide();
    $("#evaluate_page_10 .step-footer").show();
    $("#evaluate_page_10 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
  });
  $("#evaluate_page_10 button.choice").on("click", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });
  // เช็คค่าในแบบประเมินเพื่อเปิดปุ่มบันทึก
  let EVALUATE_RESULT10;
  $("#evaluate_page_10 .btn-group button").on("click", function () {
    let vaidateValue = [];
    let OSR1 = $("#OSR1 .choice.active").val();
    let OSR1A = $("#OSR1A .choice.active").val();
    let OSR1B = $("#OSR1B .choice.active").val();
    let OSR1C = $("#OSR1C .choice.active").val();
    let OSR1D = $("#OSR1D .choice.active").val();
    let OSR2 = $("#OSR2 .choice.active").val();
    if (OSR1 == 1) {
      vaidateValue = [OSR1, OSR1A, OSR1B, OSR1C, OSR1D, OSR2];
    } else {
      vaidateValue = [OSR1, OSR2];
    }

    if (validateForm(vaidateValue)) {
      $("#evaluate_page_10 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
      let data = setDataEva10();
      evaluateResult(data).then((res) => {
        EVALUATE_RESULT10 = res;
      });
    } else {
      $("#evaluate_page_10 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_10 .evaluate_page_status ").hide();
    }
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_10 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $("#evaluate_page_10 button.choice").prop("disabled", true);
      $("#evaluate_page_10 .evaluate_page_status ").show();
      $("#evaluate_page_10 .footer").show();
      $("#evaluate_page_10 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(9).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva10() {
    let OSR1A =
      $("#OSR1 .choice.active").val() == 0
        ? 0
        : parseInt($("#OSR1A .choice.active").val());
    let OSR1B =
      $("#OSR1 .choice.active").val() == 0
        ? 0
        : parseInt($("#OSR1B .choice.active").val());
    let OSR1C =
      $("#OSR1 .choice.active").val() == 0
        ? 0
        : parseInt($("#OSR1C .choice.active").val());
    let OSR1D =
      $("#OSR1 .choice.active").val() == 0
        ? 0
        : parseInt($("#OSR1D .choice.active").val());
    let OSR2 = parseInt($("#OSR2 .choice.active").val());

    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 10,
      OSR1A: OSR1A,
      OSR1B: OSR1B,
      OSR1C: OSR1C,
      OSR1D: OSR1D,
      OSR2: OSR2,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE: OSR1A + OSR1B + OSR1C + OSR1D + OSR2,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_10 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva10();
      data.EVALUATE_FLAG = EVALUATE_RESULT10.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT10.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE10", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );
  $("#evaluate_page_10 .choice").click(function () {
    if ($(this).attr("value") == "0" && $(this).attr("target")) {
      $("#eva10_sub_" + $(this).attr("target")).hide();
    } else if ($(this).attr("value") == "1" && $(this).attr("target")) {
      $("#eva10_sub_" + $(this).attr("target")).show();
    }
  });
  /* ----------------------------------------------------------------------------- end : evaluate_page_10 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_11 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_11
  function gotoEvaPage11(lastRecordId) {
    loading.show();
    $(`#evaluate_page_11 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_11 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_11 button.choice").removeClass("active");
    $(
      "#evaluate_page_11 input[type='number'],#evaluate_page_11 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_11 input[type="radio"],#evaluate_page_11 input[type="checkbox"]'
    ).prop("checked", false);
    $("#eva11_sub_1").hide();
    $("#eva11_sub_2").hide();
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE11", lastRecordId, function (lastData) {
        if (
          parseFloat(lastData.ORAL1A) +
            parseFloat(lastData.ORAL1B) +
            parseFloat(lastData.ORAL1C) >
          0
        ) {
          $(`#ORAL1 .choice[value="1"]`).addClass("active");
          $("#eva11_sub_1").show();
        } else {
          $(`#ORAL1 .choice[value="0"]`).addClass("active");
          $("#eva11_sub_1").hide();
        }
        if (
          parseFloat(lastData.ORAL2A) +
            parseFloat(lastData.ORAL2B) +
            parseFloat(lastData.ORAL2C) >
          0
        ) {
          $(`#ORAL2 .choice[value="1"]`).addClass("active");
          $("#eva11_sub_2").show();
        } else {
          $(`#ORAL2 .choice[value="0"]`).addClass("active");
          $("#eva11_sub_2").hide();
        }

        $(`#ORAL1A .choice[value="${parseInt(lastData.ORAL1A)}"]`).addClass(
          "active"
        );
        $(`#ORAL1B .choice[value="${parseInt(lastData.ORAL1B)}"]`).addClass(
          "active"
        );
        $(`#ORAL1C .choice[value="${parseInt(lastData.ORAL1C)}"]`).addClass(
          "active"
        );
        $(`#ORAL2A .choice[value="${parseInt(lastData.ORAL2A)}"]`).addClass(
          "active"
        );
        $(`#ORAL2B .choice[value="${parseInt(lastData.ORAL2B)}"]`).addClass(
          "active"
        );
        $(`#ORAL2C .choice[value="${parseInt(lastData.ORAL2C)}"]`).addClass(
          "active"
        );
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_11", function () {
        $("#evaluate_page_11 button.choice").prop("disabled", true);
        $("#evaluate_page_11 .step-footer").hide();
        $("#evaluate_page_11 .evaluate_page_status ").show();
        $("#evaluate_page_11 .footer.evaluate_page_footer ").show();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_11 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_11 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_11 button.choice").prop("disabled", false);
    $("#evaluate_page_11 button.choice").removeClass("active");
    $("#eva11_sub_1,#eva11_sub_2").hide();
    $("#evaluate_page_11 .evaluate_page_status ").hide();
    $("#evaluate_page_11 .footer").hide();
    $("#evaluate_page_11 .step-footer").show();
    $("#evaluate_page_11 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
  });
  $("#evaluate_page_11 button.choice").on("click", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });
  // เช็คค่าในแบบประเมินเพื่อเปิดปุ่มบันทึก
  let EVALUATE_RESULT11;
  $("#evaluate_page_11 .btn-group button").on("click", function () {
    let ORAL1 = $("#ORAL1 .choice.active").val();
    let ORAL2 = $("#ORAL2 .choice.active").val();
    let vaidateValue = [ORAL1, ORAL2];
    let ORAL1A = $("#ORAL1A .choice.active").val();
    let ORAL1B = $("#ORAL1B .choice.active").val();
    let ORAL1C = $("#ORAL1C .choice.active").val();
    let ORAL2A = $("#ORAL2A .choice.active").val();
    let ORAL2B = $("#ORAL2B .choice.active").val();
    let ORAL2C = $("#ORAL2C .choice.active").val();
    if (ORAL1 == 1) {
      vaidateValue.push(ORAL1A);
      vaidateValue.push(ORAL1B);
      vaidateValue.push(ORAL1C);
    }
    if (ORAL2 == 1) {
      vaidateValue.push(ORAL2A);
      vaidateValue.push(ORAL2B);
      vaidateValue.push(ORAL2C);
    }
    if (validateForm(vaidateValue)) {
      $("#evaluate_page_11 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
      let data = setDataEva11();
      evaluateResult(data).then((res) => {
        EVALUATE_RESULT11 = res;
      });
    } else {
      $("#evaluate_page_11 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_11 .evaluate_page_status ").hide();
    }
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_11 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $("#evaluate_page_11 button.choice").prop("disabled", true);
      $("#evaluate_page_11 .evaluate_page_status ").show();
      $("#evaluate_page_11 .footer").show();
      $("#evaluate_page_11 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(10).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva11() {
    let ORAL1A =
      $("#ORAL1 .choice.active").val() == 0
        ? 0
        : parseInt($("#ORAL1A .choice.active").val());
    let ORAL1B =
      $("#ORAL1 .choice.active").val() == 0
        ? 0
        : parseInt($("#ORAL1B .choice.active").val());
    let ORAL1C =
      $("#ORAL1 .choice.active").val() == 0
        ? 0
        : parseInt($("#ORAL1C .choice.active").val());
    let ORAL2A =
      $("#ORAL2 .choice.active").val() == 0
        ? 0
        : parseInt($("#ORAL2A .choice.active").val());
    let ORAL2B =
      $("#ORAL2 .choice.active").val() == 0
        ? 0
        : parseInt($("#ORAL2B .choice.active").val());
    let ORAL2C =
      $("#ORAL2 .choice.active").val() == 0
        ? 0
        : parseInt($("#ORAL2C .choice.active").val());

    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 11,
      ORAL1A: ORAL1A,
      ORAL1B: ORAL1B,
      ORAL1C: ORAL1C,
      ORAL2A: ORAL2A,
      ORAL2B: ORAL2B,
      ORAL2C: ORAL2C,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE: ORAL1A + ORAL1B + ORAL1C + ORAL2A + ORAL2B + ORAL2C,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_11 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva11();
      data.EVALUATE_FLAG = EVALUATE_RESULT11.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT11.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE11", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );
  $("#evaluate_page_11 .choice").click(function () {
    if ($(this).attr("value") == "0" && $(this).attr("target")) {
      $("#eva11_sub_" + $(this).attr("target")).hide();
    } else if ($(this).attr("value") == "1" && $(this).attr("target")) {
      $("#eva11_sub_" + $(this).attr("target")).show();
    }
  });
  /* ----------------------------------------------------------------------------- end : evaluate_page_11 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_12 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_12
  function gotoEvaPage12(lastRecordId) {
    loading.show();
    $(`#evaluate_page_12 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_12 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_12 button.choice").removeClass("active");
    $(
      "#evaluate_page_12 input[type='number'],#evaluate_page_12 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_12 input[type="radio"],#evaluate_page_12 input[type="checkbox"]'
    ).prop("checked", false);
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE12", lastRecordId, function (lastData) {
        $(`#NUTRI1 .choice[value="${parseInt(lastData.NUTRI1)}"]`).addClass(
          "active"
        );
        $(`#NUTRI2 .choice[value="${parseInt(lastData.NUTRI2)}"]`).addClass(
          "active"
        );
        $(`input[name="MNA1A"][value="${parseInt(lastData.MNA1A)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA1B"][value="${parseInt(lastData.MNA1B)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA1C"][value="${parseInt(lastData.MNA1C)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA1D"][value="${parseInt(lastData.MNA1D)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA1E"][value="${parseInt(lastData.MNA1E)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA1F"][value="${parseInt(lastData.MNA1F)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA1G"][value="${parseInt(lastData.MNA1G)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA2A"][value="${parseInt(lastData.MNA2A)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA2B"][value="${parseInt(lastData.MNA2B)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA2C"][value="${parseInt(lastData.MNA2C)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA2D"][value="${parseInt(lastData.MNA2D)}"]`).prop(
          "checked",
          true
        );
        $(
          `input[name="MNA2EA"][value="${parseFloat(lastData.MNA2EA).toFixed(
            1
          )}"]`
        ).prop("checked", true);
        $(
          `input[name="MNA2EB"][value="${parseFloat(lastData.MNA2EB).toFixed(
            1
          )}"]`
        ).prop("checked", true);
        $(
          `input[name="MNA2EC"][value="${parseFloat(lastData.MNA2EC).toFixed(
            1
          )}"]`
        ).prop("checked", true);
        $(`input[name="MNA2F"][value="${parseInt(lastData.MNA2F)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA2G"][value="${parseInt(lastData.MNA2G)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA2H"][value="${parseInt(lastData.MNA2H)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA2I"][value="${parseInt(lastData.MNA2I)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA2J"][value="${parseInt(lastData.MNA2J)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA2K"][value="${parseInt(lastData.MNA2K)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="MNA2L"][value="${parseInt(lastData.MNA2L)}"]`).prop(
          "checked",
          true
        );
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_12", function () {
        $("#evaluate_page_12 button.choice").prop("disabled", true);
        $("#evaluate_page_12 input[type='radio']").prop("disabled", true);
        $("#evaluate_page_12 .step-footer").hide();
        $("#evaluate_page_12 .evaluate_page_status ").show();
        $("#evaluate_page_12 .footer.evaluate_page_footer ").show();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_12 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_12 .footer .btn_create_evaluate").on("click", function () {
    $("#evaluate_page_12 button.choice").prop("disabled", false);
    $("#evaluate_page_12 button.choice").removeClass("active");
    $("#evaluate_page_12 input[type='radio']").prop("disabled", false);
    $("#evaluate_page_12 input[type='radio']").prop("checked", false);
    $("#evaluate_page_12 .evaluate_page_status ").hide();
    $("#evaluate_page_12 .footer").hide();
    $("#evaluate_page_12 .step-footer").show();
    $("#evaluate_page_12 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
  });
  $("#evaluate_page_12 button.choice").on("click", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });
  // เช็คค่าในแบบประเมินเพื่อเปิดปุ่มบันทึก
  let EVALUATE_RESULT12;
  $(
    "#evaluate_page_12 .btn-group button,#evaluate_page_12 input[type='radio']"
  ).on("click", function () {
    let vaidateValue = [];
    let NUTRI1 = $("#NUTRI1 .choice.active").val();
    let NUTRI2 = $("#NUTRI2 .choice.active").val();
    let MNA1A = $('input[name="MNA1A"]:checked').val();
    let MNA1B = $('input[name="MNA1B"]:checked').val();
    let MNA1C = $('input[name="MNA1C"]:checked').val();
    let MNA1D = $('input[name="MNA1D"]:checked').val();
    let MNA1E = $('input[name="MNA1E"]:checked').val();
    let MNA1F = $('input[name="MNA1F"]:checked').val();
    let MNA1G = $('input[name="MNA1G"]:checked').val();
    let MNA2A = $('input[name="MNA2A"]:checked').val();
    let MNA2B = $('input[name="MNA2B"]:checked').val();
    let MNA2C = $('input[name="MNA2C"]:checked').val();
    let MNA2D = $('input[name="MNA2D"]:checked').val();
    let MNA2EA = $('input[name="MNA2EA"]:checked').val();
    let MNA2EB = $('input[name="MNA2EB"]:checked').val();
    let MNA2EC = $('input[name="MNA2EC"]:checked').val();
    let MNA2F = $('input[name="MNA2F"]:checked').val();
    let MNA2G = $('input[name="MNA2G"]:checked').val();
    let MNA2H = $('input[name="MNA2H"]:checked').val();
    let MNA2I = $('input[name="MNA2I"]:checked').val();
    let MNA2J = $('input[name="MNA2J"]:checked').val();
    let MNA2K = $('input[name="MNA2K"]:checked').val();
    let MNA2L = $('input[name="MNA2L"]:checked').val();
    vaidateValue = [
      NUTRI1,
      NUTRI2,
      MNA1A,
      MNA1B,
      MNA1C,
      MNA1D,
      MNA1E,
      MNA1F,
      MNA1G,
      MNA2A,
      MNA2B,
      MNA2C,
      MNA2D,
      MNA2EA,
      MNA2EB,
      MNA2EC,
      MNA2F,
      MNA2G,
      MNA2H,
      MNA2I,
      MNA2J,
      MNA2K,
      MNA2L,
    ];
    if (validateForm(vaidateValue)) {
      $("#evaluate_page_12 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
      let data = setDataEva12();
      evaluateResult(data).then((res) => {
        EVALUATE_RESULT12 = res;
      });
    } else {
      $("#evaluate_page_12 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_12 .evaluate_page_status ").hide();
    }
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_12 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $("#evaluate_page_12 button.choice").prop("disabled", true);
      $("#evaluate_page_12 input[type='radio']").prop("disabled", true);
      $("#evaluate_page_12 .evaluate_page_status ").show();
      $("#evaluate_page_12 .footer").show();
      $("#evaluate_page_12 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(11).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva12() {
    let NUTRI1 = parseFloat($("#NUTRI1 .choice.active").val());
    let NUTRI2 = parseFloat($("#NUTRI2 .choice.active").val());
    let MNA1A = parseFloat($('input[name="MNA1A"]:checked').val());
    let MNA1B = parseFloat($('input[name="MNA1B"]:checked').val());
    let MNA1C = parseFloat($('input[name="MNA1C"]:checked').val());
    let MNA1D = parseFloat($('input[name="MNA1D"]:checked').val());
    let MNA1E = parseFloat($('input[name="MNA1E"]:checked').val());
    let MNA1F = parseFloat($('input[name="MNA1F"]:checked').val());
    let MNA1G = parseFloat($('input[name="MNA1G"]:checked').val());
    let MNA2A = parseFloat($('input[name="MNA2A"]:checked').val());
    let MNA2B = parseFloat($('input[name="MNA2B"]:checked').val());
    let MNA2C = parseFloat($('input[name="MNA2C"]:checked').val());
    let MNA2D = parseFloat($('input[name="MNA2D"]:checked').val());
    let MNA2EA = parseFloat($('input[name="MNA2EA"]:checked').val());
    let MNA2EB = parseFloat($('input[name="MNA2EB"]:checked').val());
    let MNA2EC = parseFloat($('input[name="MNA2EC"]:checked').val());
    let MNA2F = parseFloat($('input[name="MNA2F"]:checked').val());
    let MNA2G = parseFloat($('input[name="MNA2G"]:checked').val());
    let MNA2H = parseFloat($('input[name="MNA2H"]:checked').val());
    let MNA2I = parseFloat($('input[name="MNA2I"]:checked').val());
    let MNA2J = parseFloat($('input[name="MNA2J"]:checked').val());
    let MNA2K = parseFloat($('input[name="MNA2K"]:checked').val());
    let MNA2L = parseFloat($('input[name="MNA2L"]:checked').val());

    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 12,
      NUTRI1: NUTRI1,
      NUTRI2: NUTRI2,
      MNA1A: MNA1A,
      MNA1B: MNA1B,
      MNA1C: MNA1C,
      MNA1D: MNA1D,
      MNA1E: MNA1E,
      MNA1F: MNA1F,
      MNA1G: MNA1G,
      MNA2A: MNA2A,
      MNA2B: MNA2B,
      MNA2C: MNA2C,
      MNA2D: MNA2D,
      MNA2EA: MNA2EA,
      MNA2EB: MNA2EB,
      MNA2EC: MNA2EC,
      MNA2F: MNA2F,
      MNA2G: MNA2G,
      MNA2H: MNA2H,
      MNA2I: MNA2I,
      MNA2J: MNA2J,
      MNA2K: MNA2K,
      MNA2L: MNA2L,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE:
        NUTRI1 +
        NUTRI2 +
        MNA1A +
        MNA1B +
        MNA1C +
        MNA1D +
        MNA1E +
        MNA1F +
        MNA1G +
        MNA2A +
        MNA2B +
        MNA2C +
        MNA2D +
        MNA2EA +
        MNA2EB +
        MNA2EC +
        MNA2F +
        MNA2G +
        MNA2H +
        MNA2I +
        MNA2J +
        MNA2K +
        MNA2L,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_12 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva12();
      data.EVALUATE_FLAG = EVALUATE_RESULT12.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT12.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE12", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );
  $("#evaluate_page_12 .choice").click(function () {
    if ($(this).attr("value") == "0" && $(this).attr("target")) {
      $("#eva12_sub_" + $(this).attr("target")).show();
    } else if ($(this).attr("value") == "1" && $(this).attr("target")) {
      $("#eva12_sub_" + $(this).attr("target")).show();
    }
  });
  /* ----------------------------------------------------------------------------- end : evaluate_page_12 ----------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------- start : evaluate_page_13 ----------------------------------------------------------------------------- */
  // เปลี่ยนหน้าไป evaluate_page_13
  function gotoEvaPage13(lastRecordId) {
    loading.show();
    $(`#evaluate_page_13 .evaluate_page_status`).removeClass(
      "alert alert-yellow alert-red"
    );
    $(`#evaluate_page_13 .evaluate_page_status p`)
      .eq(1)
      .text("ยังไม่ได้ทำแบบประเมิน");
    $("#evaluate_page_13 button.choice").removeClass("active");
    $(
      "#evaluate_page_13 input[type='number'],#evaluate_page_13 input[type='text']"
    ).val("");
    $(
      '#evaluate_page_13 input[type="radio"],#evaluate_page_13 input[type="checkbox"]'
    ).prop("checked", false);
    if (lastRecordId > 0) {
      queryByRowID("VHV_TR_EVALUATE13", lastRecordId, function (lastData) {
        $(`input[name="ADL1"][value="${parseInt(lastData.ADL1)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="ADL2"][value="${parseInt(lastData.ADL2)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="ADL3"][value="${parseInt(lastData.ADL3)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="ADL4"][value="${parseInt(lastData.ADL4)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="ADL5"][value="${parseInt(lastData.ADL5)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="ADL6"][value="${parseInt(lastData.ADL6)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="ADL7"][value="${parseInt(lastData.ADL7)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="ADL8"][value="${parseInt(lastData.ADL8)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="ADL9"][value="${parseInt(lastData.ADL9)}"]`).prop(
          "checked",
          true
        );
        $(`input[name="ADL10"][value="${parseInt(lastData.ADL10)}"]`).prop(
          "checked",
          true
        );
        evaluateResult(lastData).then((res) => {});
      });
    }
    setTimeout(function () {
      loading.hide();
      changePage("evaluate_page_13", function () {
        $('#evaluate_page_13 input[type="radio"]').prop("disabled", true);
        $("#evaluate_page_13 .step-footer").hide();
        $("#evaluate_page_13 .evaluate_page_status ").show();
        $("#evaluate_page_13 .footer.evaluate_page_footer ").show();
      });
    }, 500);
  }
  // ปุ่ม back
  $("#evaluate_page_13 .evaluate_page_header .back_header_btn").on(
    "click",
    function () {
      showModal("modal-evaluate-alert");
    }
  );
  // ปุ่ม เริ่มประเมินใหม่
  $("#evaluate_page_13 .footer .btn_create_evaluate").on("click", function () {
    $('#evaluate_page_13 input[type="radio"]').prop("disabled", false);
    $('#evaluate_page_13 input[type="radio"]').prop("checked", false);
    $("#evaluate_page_13 .evaluate_page_status ").hide();
    $("#evaluate_page_13 .footer").hide();
    $("#evaluate_page_13 .step-footer").show();
    $("#evaluate_page_13 .step-footer .btn_group .submit").prop(
      "disabled",
      true
    );
  });
  $("#evaluate_page_13 button.choice").on("click", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });
  // เช็คค่าในแบบประเมินเพื่อเปิดปุ่มบันทึก
  let EVALUATE_RESULT13;
  $('#evaluate_page_13 input[type="radio"]').change(function () {
    let ADL1 = $('input[name="ADL1"]:checked').val();
    let ADL2 = $('input[name="ADL2"]:checked').val();
    let ADL3 = $('input[name="ADL3"]:checked').val();
    let ADL4 = $('input[name="ADL4"]:checked').val();
    let ADL5 = $('input[name="ADL5"]:checked').val();
    let ADL6 = $('input[name="ADL6"]:checked').val();
    let ADL7 = $('input[name="ADL7"]:checked').val();
    let ADL8 = $('input[name="ADL8"]:checked').val();
    let ADL9 = $('input[name="ADL9"]:checked').val();
    let ADL10 = $('input[name="ADL10"]:checked').val();
    if (
      validateForm([
        ADL1,
        ADL2,
        ADL3,
        ADL4,
        ADL5,
        ADL6,
        ADL7,
        ADL8,
        ADL9,
        ADL10,
      ])
    ) {
      $("#evaluate_page_13 .step-footer .btn_group .submit").prop(
        "disabled",
        false
      );
      let data = setDataEva13();
      evaluateResult(data).then((res) => {
        EVALUATE_RESULT13 = res;
      });
    } else {
      $("#evaluate_page_13 .step-footer .btn_group .submit").prop(
        "disabled",
        true
      );
      $("#evaluate_page_13 .evaluate_page_status ").hide();
    }
  });
  // ปุ่ม ยกเลิก
  $("#evaluate_page_13 .step-footer .btn_group .cancel").on(
    "click",
    function () {
      $('#evaluate_page_13 input[type="radio"]').prop("disabled", true);
      $("#evaluate_page_13 .evaluate_page_status ").show();
      $("#evaluate_page_13 .footer").show();
      $("#evaluate_page_13 .step-footer").hide();
      $("#evaluate_detail_page .evaluate_card").eq(12).click();
    }
  );
  // ปุ่ม บันทึก
  function setDataEva13() {
    let ADL1 = parseInt($('input[name="ADL1"]:checked').val());
    let ADL2 = parseInt($('input[name="ADL2"]:checked').val());
    let ADL3 = parseInt($('input[name="ADL3"]:checked').val());
    let ADL4 = parseInt($('input[name="ADL4"]:checked').val());
    let ADL5 = parseInt($('input[name="ADL5"]:checked').val());
    let ADL6 = parseInt($('input[name="ADL6"]:checked').val());
    let ADL7 = parseInt($('input[name="ADL7"]:checked').val());
    let ADL8 = parseInt($('input[name="ADL8"]:checked').val());
    let ADL9 = parseInt($('input[name="ADL9"]:checked').val());
    let ADL10 = parseInt($('input[name="ADL10"]:checked').val());
    let data = {
      ELDER_ID: evaluate_elder_id,
      EVALUATE_DATE: getCurrentDate(),
      EVALUATE_NO: 13,
      ADL1: ADL1,
      ADL2: ADL2,
      ADL3: ADL3,
      ADL4: ADL4,
      ADL5: ADL5,
      ADL6: ADL6,
      ADL7: ADL7,
      ADL8: ADL8,
      ADL9: ADL9,
      ADL10: ADL10,
      EVALUATE_FLAG: "",
      EVALUATE_SCORE:
        ADL1 + ADL2 + ADL3 + ADL4 + ADL5 + ADL6 + ADL7 + ADL8 + ADL9 + ADL10,
      EVALUATE_RESULT: "",
    };
    return data;
  }
  $("#evaluate_page_13 .step-footer .btn_group .submit").on(
    "click",
    function () {
      let data = setDataEva13();
      data.EVALUATE_FLAG = EVALUATE_RESULT13.EVALUATE_FLAG;
      data.EVALUATE_RESULT = EVALUATE_RESULT13.EVALUATE_RESULT;
      console.log(data);
      sqlInsert("VHV_TR_EVALUATE13", data, function (inserted_id) {
        console.log(inserted_id);
        chkStatusEvaAll();
        sqlUpdate(
          "VHV_TR_ELDER",
          { HEALTH_STATUS: data.EVALUATE_FLAG, UPDATE_FLAG: 1 },
          evaluate_elder_id,
          function (res) {}
        );
        reloadEvaluateList();
        $("#evaluate_detail_page .footer.evaluate-success").show();
        changePage("evaluate_detail_page", function () {
          readerAfterSaveEva();
          setTimeout(function () {
            $("#evaluate_detail_page .footer.evaluate-success").hide();
          }, 1000);
        });
      });
    }
  );

  $("#evaluate_page_13 .choice").click(function () {
    if ($(this).attr("value") == "0" && $(this).attr("target")) {
      $("#eva13_sub_" + $(this).attr("target")).hide();
    } else if ($(this).attr("value") == "1" && $(this).attr("target")) {
      $("#eva13_sub_" + $(this).attr("target")).show();
    }
  });
  /* ----------------------------------------------------------------------------- end : evaluate_page_13 ----------------------------------------------------------------------------- */
  function setProgressevaluate(percent) {
    var circle = document.querySelector(".progress_ring_circle_evaluate");
    var radius = circle.r.baseVal.value;
    var circumference = radius * 2 * Math.PI;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
    const offset =
      circumference - ((percent * (100 / 13)) / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }
  //check img
  function checkImg() {
    let img = $(".image_upload_preview img").prop("src");
    console.log(img);
    if (img.length == 0) {
      $(".image_upload_preview").hide();
      $("button.camera").show();
    } else {
      $(".image_upload_preview").show();
      $("button.camera").hide();
    }
  }
 
  function evaluateResult(data) {
    console.log(data);
    return new Promise((resolve, reject) => {
      let result;
      queryALL("VHV_MA_EVALUATE", function (evaResultAll) {
        let evaResult = evaResultAll.filter(
          (item) => item.EVALUATE_NO == data.EVALUATE_NO
        );
        console.log(evaResult);
        if (data.EVALUATE_NO != 2) {
          result = evaResult.find(
            (item) =>
              parseFloat(item.EVALUATE_MIN) <=
                parseFloat(data.EVALUATE_SCORE) &&
              parseFloat(item.EVALUATE_MAX) >= parseFloat(data.EVALUATE_SCORE)
          );

          $(
            `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
          ).removeClass("alert");
          $(
            `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
          ).removeClass("alert-red");
          $(
            `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
          ).removeClass("alert-yellow");
          if (result) {
            $(`#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status p`)
              .eq(1)
              .text(result.EVALUATE_RESULT);
            if (result.EVALUATE_FLAG == 1) {
              $(
                `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
              ).addClass("alert-yellow");
            } else if (result.EVALUATE_FLAG == 2) {
              $(
                `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
              ).addClass("alert");
            } else if (result.EVALUATE_FLAG == 3) {
              $(
                `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
              ).addClass("alert-red");
            }
          } else {
            $(
              `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
            ).addClass("alert-red");
            $(`#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status p`)
              .eq(1)
              .text("ไม่สามารถประมวลผลการทดสอบได้");
          }

          $(`#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`).fadeIn(
            1000
          );
        } else {
          let RESULTSBP = evaResult.find(
            (item) =>
              parseFloat(item.EVALUATE_SUBNO) == 1 &&
              parseFloat(item.EVALUATE_MIN) <= parseFloat(data.SCORESBP) &&
              parseFloat(item.EVALUATE_MAX) >= parseFloat(data.SCORESBP)
          );

          let RESULTDBP = evaResult.find(
            (item) =>
              parseFloat(item.EVALUATE_SUBNO) == 2 &&
              parseFloat(item.EVALUATE_MIN) <= parseFloat(data.SCOREDBP) &&
              parseFloat(item.EVALUATE_MAX) >= parseFloat(data.SCOREDBP)
          );
          $(
            `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
          ).removeClass("alert");
          $(
            `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
          ).removeClass("alert-red");
          $(
            `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
          ).removeClass("alert-yellow");
          var result = {
            EVALUATE_RESULT: "ไม่สามารถประมวลผลได้",
            EVALUATE_FLAG: 0,
          };
          if (RESULTSBP && RESULTDBP) {
            if (RESULTSBP.EVALUATE_FLAG >= RESULTDBP.EVALUATE_FLAG) {
              result.EVALUATE_RESULT = RESULTSBP.EVALUATE_RESULT;
              result.EVALUATE_FLAG = RESULTSBP.EVALUATE_FLAG;
            } else {
              result.EVALUATE_RESULT = RESULTDBP.EVALUATE_RESULT;
              result.EVALUATE_FLAG = RESULTDBP.EVALUATE_FLAG;
            }
          } else {
            $(
              `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
            ).addClass("alert-red");
          }

          $(`#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status p`)
            .eq(1)
            .text(result.EVALUATE_RESULT);
          if (result.EVALUATE_FLAG == 1) {
            $(
              `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
            ).addClass("alert-yellow");
          } else if (result.EVALUATE_FLAG == 2) {
            $(
              `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
            ).addClass("alert");
          } else if (result.EVALUATE_FLAG == 3) {
            $(
              `#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`
            ).addClass("alert-red");
          }
          $(`#evaluate_page_${data.EVALUATE_NO} .evaluate_page_status`).fadeIn(
            1000
          );
          result = { RESULTSBP, RESULTDBP };
        }

        resolve(result);
      });
    });
  }
});
