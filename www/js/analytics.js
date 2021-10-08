$(function () {
 
  var chart_male
  var chart_female
  const chart_config = {
    type: "doughnut",
    data: {},
    plugins: [ChartDataLabels],
    options: {
      plugins: {
        legend: { display: false },
        datalabels: {
          formatter: (value) => {
            return value!=0?value:'';
          }
          ,color:"#FFFFFF",
          font:{
            family:"Prompt",
            weight:"bold"
          }
        }
      },
      responsive: true,
      cutout: "70%",
      borderWidth:0
    },
  };
  chart_male = new Chart($("#chart-analytics-male"), {...chart_config});
  chart_female = new Chart($("#chart-analytics-female"), {...chart_config});
  $(".menu_analytics_page").on("click", function () {
    changePage("analytics_page", function () {
      loading.show();
      initialAnalyticsPageFunc();
      setTimeout(function () {
        loading.hide();
      }, 500);
    });
  });
  $("#analytics_page .header .back_header_btn").on("click", function () {
    changePage('home_page', function () {
    });
  });
  $(".selected_analytics").on('click',function(){
    console.log( $("#analytics_page .sort-list"))
    showModal("modal-analytics");
  })
  
  $("input[type='radio'][name='analytics-option']").on('change',function(){
    setChartData($(this).val()).then(function(data){
      renderChart(data)
     });
    let title = $(this).siblings('label').text()
    $(".selected_analytics input").val(title)
    $("#analytics_page .content-title").text(title)
    $("#modal-analytics .modal-dismiss").click()
  })
  function initialAnalyticsPageFunc() {
    $("#analytics-option-1").prop("checked",true)
    $(".selected_analytics input").val($("input[type='radio'][name='analytics-option']:first").siblings('label').text())
    $("#analytics_page .content-title").text($("input[type='radio'][name='analytics-option']:first").siblings('label').text())
    setChartData(1).then(function(data){
    renderChart(data)
   });
    
  }
  function queryDataChart(evaluateNo,_callback){
    let arr =[]
    db.transaction(function (tx) {
      tx.executeSql(
        // "SELECT t1.rowid,t1.ELDER_ID,t1.EVALUATE_FLAG FROM VHV_TR_EVALUATE"+evaluateNo+" t1",
        "select * from (select * from VHV_TR_EVALUATE"+evaluateNo+" order by rowid desc) v group by v.ELDER_ID",
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
  function setChartData(eva_no){
    return new Promise((resovle,reject)=>{
      let resultMale = {
        labels: [ "ปกติ","มีปัญหา", "รอประเมิน"],
        datasets: [
          {
            label: "chart",
            data: [],
            backgroundColor: ["#54D5BB", "#F53F4D", "rgb(255, 205, 86)"],
            hoverOffset: 0,
          },
        ],
      };
      let resultFemale = {
        labels: [ "ปกติ","มีปัญหา", "รอประเมิน"],
        datasets: [
          {
            label: "chart",
            data: [],
            backgroundColor: ["#54D5BB", "#F53F4D", "rgb(255, 205, 86)"],
            hoverOffset: 0,
          },
        ],
      };
      queryDataChart(eva_no,function(evaluated){
       
        $('#analytics_page .last-update').text(`อัพเดทเมื่อ : ${evaluated.length>0?dateStringFormat(evaluated[evaluated.length-1].EVALUATE_DATE):'ไม่มีข้อมูล'}`)
        queryALL('VHV_TR_ELDER',function(elders){
          let data = elders.map(elder=>({...elder,evaluated:evaluated.filter(eva =>eva.ELDER_ID==elder.ID)}))
          let male = data.filter(row=>row.ELDER_SEX==1)
          let female = data.filter(row=>row.ELDER_SEX==2)
          resultMale.total = male.length
          resultFemale.total = female.length
          if(eva_no!=2){
            resultMale.datasets[0].data = [
              male.filter(row=>{
                if(row.evaluated.length>0){
                  if(row.evaluated[0].EVALUATE_FLAG==0) {
                    return row
                  }
                }
              }).length,
              male.filter(row=>{
                if(row.evaluated.length>0){
                  if(row.evaluated[0].EVALUATE_FLAG>0) {
                    return row
                  }
                }
              }).length,
              male.filter(row=>{
                if(row.evaluated.length==0){ 
                    return row
                }
              }).length,
            ]
              resultFemale.datasets[0].data = [
              female.filter(row=>{
                if(row.evaluated.length>0){
                  if(row.evaluated[0].EVALUATE_FLAG==0) {
                    return row
                  }
                }
              }).length,
              female.filter(row=>{
                if(row.evaluated.length>0){
                  if(row.evaluated[0].EVALUATE_FLAG>0) {
                    return row
                  }
                }
              }).length,
              female.filter(row=>{
                if(row.evaluated.length==0){ 
                    return row
                }
              }).length,
            ]
          }else{
            resultMale.datasets[0].data = [
              male.filter(row=>{
                if(row.evaluated.length>0){
                  if(row.evaluated[0].FLAGSBP==0 &&row.evaluated[0].FLAGDBP==0 ) {
                    return row
                  }
                }
              }).length,
              male.filter(row=>{
                if(row.evaluated.length>0){
                  if(row.evaluated[0].FLAGSBP!=0 ||row.evaluated[0].FLAGDBP!=0) {
                    return row
                  }
                }
              }).length,
              male.filter(row=>{
                if(row.evaluated.length==0){ 
                    return row
                }
              }).length,
            ]
              resultFemale.datasets[0].data = [
              female.filter(row=>{
                if(row.evaluated.length>0){
                  if(row.evaluated[0].FLAGSBP==0 &&row.evaluated[0].FLAGDBP==0 ) {
                    return row
                  }
                }
              }).length,
              female.filter(row=>{
                if(row.evaluated.length>0){
                  if(row.evaluated[0].FLAGSBP!=0 ||row.evaluated[0].FLAGDBP!=0) {
                    return row
                  }
                }
              }).length,
              female.filter(row=>{
                if(row.evaluated.length==0){ 
                    return row
                }
              }).length,
            ]
          }
          resovle({resultMale,resultFemale}) 
        })
  
      })
   
    })
   
  }
  function renderChart(data){
    console.log(data)
    chart_male.data =data.resultMale
    chart_female.data=data.resultFemale
    $("#chart-analytics-male").addClass('render')
    $("#chart-analytics-male").siblings('.total').text(`(จากจำนวน ${data.resultMale.total} คน)`)
    $("#chart-analytics-female").addClass('render')
    $("#chart-analytics-female").siblings('.total').text(`(จากจำนวน ${data.resultFemale.total} คน)`)
    chart_male.update();
    chart_female.update();
  }
});
