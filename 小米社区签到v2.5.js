/*
 *小米社区自动签到脚本
 *
 * 原作者  by：PJ小宇    QQ：898811295
 * 修改    by：风中拾叶
 * 三改    by：wengzhenquan
 * 版本号：20250320
 */

// 引入配置文件
var config = require("./config.js");

delayRun(); //随机延时，再执行脚本
countRunTime(); //计时脚本运行时间
//curTime = new Date();
// date = curTime.getFullYear() + "-" + (curTime.getMonth() + 1) + "-" + curTime.getDate();
date = formatDate(new Date());
sleep(500);
var centerX;
var centerY;
var rX;
var percentage;
var dwidth = device.width;
var dheight = device.height;
var myTextView;
//  适配我的小米6x
if (config.oldDevice) {
  myTextView = "android.view.View";
} else {
  myTextView = "android.widget.TextView";
}
log(`今天是：${date}`);
log(`设备分辨率：${dwidth}x${dheight}`);
// 调用main函数
main();

function formatDate(date) {
  // 获取年、月、日、时、分、秒
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");
  let hours = date.getHours().toString().padStart(2, "0");
  let minutes = date.getMinutes().toString().padStart(2, "0");
  let seconds = date.getSeconds().toString().padStart(2, "0");

  // 拼接格式化后的日期字符串
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  //return `${year}-${month}-${day}`;
}

//解锁
function unLock() {
  device.keepScreenOn(3600 * 1000);
  log("开始解锁设备");
  sleep(500);
  // 不知为何swipe滑动持续时间210就可以打开屏幕，其他就不能打开小米6x的屏幕
  // 例如300时就打不开屏幕
  if (
    swipe(
      (dwidth * 1) / 2,
      dheight * 0.96,
      (dwidth * 1) / 2,
      (dheight * 1) / 2,
      210
    )
  ) {
    log("上滑成功");
  } else {
    gesture(
      100,
      [(dwidth * 1) / 2, dheight * 0.96],
      [(dwidth * 1) / 2, (dheight * 1) / 2]
    );
  }
  sleep(500);
  if (config.解锁方式 == 1) {
    log("图案解锁");
    gesture(800, config.锁屏图案坐标);
  } else if (config.解锁方式 == 2) {
    log("数字密码解锁");
    for (let i = 0; i < config.锁屏数字密码.length; i++) {
      desc(config.锁屏数字密码[i]).findOne().click();
    }
  }
}

//关闭程序
function killAPP(packageName) {
  app.openAppSetting(packageName);
  sleep(600);
  let yyxx = textContains("小米社区" && "权限");
  let i = 0;
  while (!yyxx.exists()) {
    log("没有找到小米社区App");
    if (i % 2 === 0) app.openAppSetting(app.getPackageName("小米社区"));
    else app.openAppSetting(packageName);
    sleep(600);
    i++;
    if (i > 3) {
      let yyxq = className("android.widget.TextView").text("应用详情");
      if (yyxq.findOne(300)) {
        back();
        break;
      }

      return;
    }
  }
  let end = className("android.widget.TextView").text("结束运行").findOne(300);
  if (end) {
    end.parent().click();
    //click(end.parent().centerX()*0.95, end.parent().centerY());
  } else {
    click("结束运行" || "强行停止");
  }
  sleep(500);
  let qued = className("android.widget.Button")
    .textContains("确定")
    .findOne(300);
  if (qued) {
    qued.click();
    toastLog("结束小米社区", "forcible");
  }
}

//打开程序
function launchAPP(packageName) {
  toastLog("正在尝试直接调起小米社区APP", "forcible");
  app.launch(packageName);
  sleep(1500);
  let xmsqAPP = className("android.widget.ImageView")
    .desc("签到")
    .packageName("com.xiaomi.vipaccount");
  let n = 0;
  while (!xmsqAPP.findOne(888)) {
    //链式调用权限触发，点“始终允许”
    let dk = className("android.widget.TextView").textContains("想要打开");
    if (dk.exists()) {
      sleep(200);
      className("android.widget.Button").textContains("允许").findOne().click();
      break;
    }
    // 两种启动写法
    if (n % 2 === 0) app.launchApp("小米社区");
    else app.launchPackage(packageName);
    sleep(1000);
    n++;
    if (n > 3) {
      toastLog(
        "堵车我就抄小路，" + "\n" + "看我排水沟过弯大法！",
        "long",
        "forcible"
      );
      // 从详情页启动小米社区
      let yyxx = className("android.widget.TextView")
        .text("应用信息")
        .findOne(200);
      let yyxq = className("android.widget.TextView").text("应用详情");
      if (yyxx) {
        className("android.widget.LinearLayout").desc("更多").findOne().click();
        sleep(300);
        let yyxq1 = yyxq.findOne();
        click(yyxq1.bounds().centerX(), yyxq1.bounds().centerY());
        sleep(300);
      }
      if (yyxq.exists()) {
        let run1 = className("android.widget.TextView").text("启动");
        while (!run1.exists()) {
          // 上滑寻找“启动”
          swipe(
            (dwidth * 1) / 2,
            (dheight * 4) / 5,
            (dwidth * 1) / 2,
            (dheight * 1) / 2,
            300
          );
        }
        let run2 = run1.findOne();
        click(run2.centerX(), run2.centerY());
        sleep(1000);
        break;
      }

      toastLog("无法打开小米社区", "forcible");
      notice(
        String("出错了！(" + date.substr(5, 14) + ")"),
        String("无法打开小米社区APP！")
      );

      //sleep(500);
      return false;
    }
  }

  toastLog("成功打开小米社区", "forcible");
  return true;
}

let inVlog = false;
//浏览帖子
function posts(n) {
  //toastLog("打开帖子", "forcible");
  toastLog("准备浏览帖子10s……", "long", "forcible");
  // 返回到小米社区首页
  backAppIndex();

  //  如果不是第一次，则刷新界面
  if (n > 1) {
    // 下滑刷新列表
    swipe(
      (dwidth * 1) / 2,
      (dheight * 3) / 5,
      (dwidth * 1) / 2,
      (dheight * 4) / 5,
      300
    );
    sleep(2000);
  }

  toastLog("小米社区重置首页成功!，准备进入帖子", "forcible");

  //  findOne(888) 表示查找控件的超时时间为 888 毫秒。如果在 888 毫秒内未找到，pkly 的值为 null。
  let pkly = className("android.widget.ImageView").desc("评论").findOne(888);
  if (pkly) {
    let tiezi = pkly.parent().parent();
    //  点击帖子的中心位置，进入帖子
    click(tiezi.centerX(), tiezi.centerY());
    sleep(500);

    // 下面代码是判断有没有进入帖子中，因为帖子中会有“关注”组件
    // 有的帖子不存在“关注组件”，所以返回重新打开
    // 并且小米6x的小米社区的”关注“组件不一样，所以才一直找不到
    let gz = className(myTextView).text("关注");
    // 如果帖子中不含"关注"控件，退出 刷新 重新进入。
    if (!gz.findOne(2666)) {
      log("帖子打开失败，重试！");
      toastLog("进入帖子失败，未找到关注按钮!", "long", "forcible");
      inVlog = false;
    } else {
      toastLog("进入帖子成功，找到关注按钮!");
      inVlog = true;
    }
  }
  toastLog("输出当前是否进入帖子inVlog: " + inVlog);
  if (!inVlog) {
    if (n > 5) {
      toastLog("打开帖子失败");
      return;
    }
    toastLog("第" + n + "次重试");
    return posts(n + 1);
  } else {
    sleep(11000);
    // sleep(6000);
    toastLog("浏览10s完成", "forcible");

    // 返回
    back();
    return;
  }
}

// 重置到小米社区论坛页
function backAppIndex() {
  //发现退回图片
  let backImg = className("android.widget.Image").text("返回");
  while (backImg.exists()) {
    backImg.findOne().click();
    sleep(300);
  }
  //发现退回按钮
  let backBut = className("android.widget.Button").text("后退");
  while (backBut.exists()) {
    backBut.findOne().click();
    sleep(300);
  }
  // 返回“论坛”页
  let index = className("android.widget.TextView").text("论坛");
  let xmsqAPP = className("android.widget.ImageView").desc("签到");
  while (
    xmsqAPP.exists() &&
    (xmsqAPP.findOne(888).centerX() < 0 || findOne(888).centerY() < 0)
  ) {
    let indexAble = index.findOne(1500);
    if (indexAble) {
      indexAble.click();
      indexAble.parent().click();
      sleep(300);
    }
  }
  let pingLun = className("android.widget.ImageView").desc("评论");
  while (
    pingLun.exists() &&
    (pingLun.findOne(888).centerX() < 0 || pingLun.findOne(888).centerY() < 0)
  ) {
    let indexAble = index.findOne(1500);
    if (indexAble) {
      indexAble.click();
      indexAble.parent().click();
      sleep(300);
    }
  }
}

//寻找坐标
function findCenter() {
  toastLog("开始小米社区aap签到", "short", "forcible");
  className(myTextView).text("立即签到").findOne().click();

  sleep(600);
  if (!images.requestScreenCapture()) {
    toastLog("请求截图失败", "forcible");
    exit();
  }
  // 休眠2s再截图
  sleep(2000);
  var pictures2 = images.clip(captureScreen(), 0, 0, dwidth, dheight);
  images.save(pictures2, "./tmp/pictures2.png", "png", 100);
  var img2 = images.read("./tmp/pictures2.png");
  // 读取滑块图片
  var wx = readHk();
  // toastLog("大图片宽度：" + img2.width + "，大图高度：" + img2.height);
  // toastLog("小图片宽度：" + wx.width + "，小图高度：" + wx.height);

  //截图并找图
  var p = findImage(img2, wx, {
    //region: [0, 50],
    threshold: 0.8,
  });
  if (p) {
    // 计算小图在大图中的中心坐标
    centerX = p.x + wx.width / 2;
    centerY = p.y + wx.height / 2;
    rX = p.x + (wx.width * 3) / 4;
    pY = p.y;
    // 显示找到的小图中心坐标
    log("找到滑块中心坐标：(" + centerX + ", " + centerY + ")");
    img2.recycle();
    wx.recycle();
    qd(); //开始签到
  } else {
    // 可能是因为pictures2截图截太快了，没截好。改成休眠2s的
    toastLog("没有在pictures2中找到滑块", "forcible");
  }
  // sleep(500);
}

// 读取滑块图片hk.png
function readHk() {
  //先根据分辨率读
  var hk = `hk/hk_${dwidth}x${dheight}` + `.png`;
  var wx = images.read("./" + hk);
  // 分辨率找不到，就读预制的图
  if (null === wx) {
    toastLog("ERROR: hk文件夹下没有图片: " + hk + "\t尝试使用默认", "forcible");
    wx = images.read("./hk.png");
  }
  return wx;
}

//签到
function qd() {
  var len;
  var con = config.con;
  var sta = "10(0{" + con + ",})1";
  if (!images.requestScreenCapture()) {
    toastLog("请求截图失败", "long", "forcible");
    notice(
      String("出错了！(" + date.substr(5, 14) + ")"),
      String("请求截图失败！")
    );

    exit();
  }
  var img2 = images.read("./tmp/pictures2.png");
  var pictures = images.clip(
    img2,
    rX,
    (dheight * 1) / 3 + 30,
    (dwidth * 5) / 6 - rX,
    pY - (dheight * 1) / 3 - 30
  );
  images.save(pictures, "./tmp/pictures.png", "png", 100);
  img2.recycle();
  var img = images.read("./tmp/pictures.png");
  var result = images.inRange(img, "#000000", "#858585");
  images.save(result, "./tmp/result.png", "png", 100);
  img.recycle();
  var image = images.read("./tmp/result.png");
  var path = "./tmp/test.txt";
  if (files.exists(path)) {
    files.write(path, "");
  }
  var width = image.getWidth();
  var height = image.getHeight();
  for (let i = 1; i < height; i += 4) {
    var s = "";
    for (let j = 1; j < width; j += 2) {
      var number = images.pixel(image, j, i);
      var color = colors.toString(number);
      var ss = color == "#000000" ? 1 : 0;
      s += ss;
    }
    files.append(path, s + "\n");
    var matches = s.match(new RegExp(sta, "g"));
    if (matches) {
      var sum = 0;
      for (let i = 0; i < matches[0].length; i++) {
        if (matches[0][i] == 0) {
          sum += 1;
        }
      }
      log("缺口长度为" + sum);
      length = matches[0].length - 1;
      image.recycle();
      break;
    }
  }
  len = -1;
  let index = s.indexOf(matches);
  if (index > -1) {
    len = rX + index * 2 + length;
    log("缺口中心:" + len);
  }
  if (len > -1) {
    toastLog("开始模拟滑动", "forcible");
    let random1 = parseInt(random(-5, 5));
    let xyDis = len - centerX;
    let sx = centerX + random1;
    let ex = sx + xyDis;
    let sy = centerY + random1;
    let ey = centerY + parseInt(random(-30, 30));
    log("贝塞尔曲线滑动");
    swipeBezierzier(sx, sy, ex, ey);

    var done = textContains("已签到").findOne(4000);
    if (done) {
      toastLog("签到完成", "forcible");
      return;
    } else {
      log("ERROR: 社区签到失败，未能完成签到滑动");
      notice(
        String("签到失败！(" + date.substr(5, 14) + ")"),
        String("重新执行一次脚本试试吧！")
      );
    }
  } else {
    log("ERROR: 社区签到失败2");
  }
}

// 贝塞尔曲线滑动
function swipeBezierzier(sx, sy, ex, ey) {
  function bezierCreate(x1, y1, x2, y2, x3, y3, x4, y4) {
    //构建参数
    var h = 100;
    var cp = [
      {
        x: x1,
        y: y1 + h,
      },
      {
        x: x2,
        y: y2 + h,
      },
      {
        x: x3,
        y: y3 + h,
      },
      {
        x: x4,
        y: y4 + h,
      },
    ];
    var numberOfPoints = 100;
    var curve = [];
    var dt = 1.0 / (numberOfPoints - 1);

    //计算轨迹
    for (var i = 0; i < numberOfPoints; i++) {
      var ax, bx, cx;
      var ay, by, cy;
      var tSquared, tCubed;
      var result_x, result_y;

      cx = 3.0 * (cp[1].x - cp[0].x);
      bx = 3.0 * (cp[2].x - cp[1].x) - cx;
      ax = cp[3].x - cp[0].x - cx - bx;
      cy = 3.0 * (cp[1].y - cp[0].y);
      by = 3.0 * (cp[2].y - cp[1].y) - cy;
      ay = cp[3].y - cp[0].y - cy - by;

      var t = dt * i;
      tSquared = t * t;
      tCubed = tSquared * t;
      result_x = ax * tCubed + bx * tSquared + cx * t + cp[0].x;
      result_y = ay * tCubed + by * tSquared + cy * t + cp[0].y;
      curve[i] = {
        x: result_x,
        y: result_y,
      };
    }

    //轨迹转路数组
    var array = [];
    for (var i = 0; i < curve.length; i++) {
      try {
        var j = i < 100 ? i : 199 - i;
        xx = parseInt(curve[j].x);
        yy = parseInt(Math.abs(100 - curve[j].y));
      } catch (e) {
        break;
      }
      array.push([xx, yy]);
    }

    return array;
  }

  function randomSwipe(sx, sy, ex, ey) {
    //设置随机滑动时长范围
    var timeMin = 1000;
    var timeMax = 2200;
    //设置控制点极限距离
    var leaveHeightLength = 60;
    //log([sx, sy, ex, ey]);
    if (Math.abs(ex - sx) > Math.abs(ey - sy)) {
      var my = (sy + ey) / 2;
      var y2 = my + random(0, leaveHeightLength);
      var y3 = my - random(0, leaveHeightLength);

      var lx = (sx - ex) / 3;
      if (lx < 0) {
        lx = -lx;
      }
      var x2 = sx + lx / 2 + random(0, lx);
      var x3 = sx + lx + lx / 2 + random(0, lx);
    } else {
      var mx = (sx + ex) / 2;
      var y2 = mx + random(0, leaveHeightLength);
      var y3 = mx - random(0, leaveHeightLength);

      var ly = (sy - ey) / 3;
      if (ly < 0) {
        ly = -ly;
      }
      var y2 = sy + ly / 2 + random(0, ly);
      var y3 = sy + ly + ly / 2 + random(0, ly);
    }

    //获取运行轨迹，及参数
    var time = [0, random(timeMin, timeMax)];
    var track = bezierCreate(sx, sy, x2, y2, x3, y3, ex, ey);

    // log("随机控制点A坐标："+x2+","+y2)
    // log("随机控制点B坐标："+x3+","+y3)
    // log("随机滑动时长："+time[1])

    //滑动
    toastLog("社区签到准备滑动", "forcible");
    gestures(time.concat(track));
  }
  randomSwipe(sx, sy, ex, ey);
}

//拔萝卜活动
function see() {
  swipe(500, 1500, 500, 500, 800);
  toastLog("拔萝卜活动签到", "forcible");
  var button = className("android.widget.Button").text("去看看").findOne(1500);
  if (button) {
    button.click();
    sleep(500);
    back();
  } else {
    toastLog("未找到'去看看'按钮", "forcible");
  }
}

//米粉节活动
function fans() {
  var button = className("android.widget.Button").text("去参与").findOne(1500);
  if (button) {
    button.click();
    toastLog("打开米粉节活动", "forcible");
    var dianl = className("android.widget.Button")
      .text("点亮今日足迹")
      .findOne(1200);
    var chouka = className("android.widget.Button")
      .text("抽取今日祝福")
      .findOne(1200);
    if (dianl || chouka) {
      clickAndLog(dianl || chouka);
      back();
    } else {
      toastLog("未找米粉节参与按钮", "forcible");
    }
  } else {
    toastLog("未找到'去参与'按钮", "forcible");
  }
}

//米粉节活动按钮
function clickAndLog(button) {
  if (button) {
    button.click();
    log("点击了按钮: " + button.text());
    button2 = className("android.widget.Button")
      .text("抽取今日祝福")
      .findOne(1200)
      .click();
    if (button2) {
      toastLog("今日祝福已抽取", "forcible");
    }
  } else {
    toastLog("按钮为空，无法点击", "forcible");
  }
}

//观看视频
function watchVideo() {
  var watch = className("android.widget.Button").text("去浏览").findOne(1000); //查找'去浏览'按钮
  if (watch) {
    var randomsleep = random(10000, 15000);
    var stime = new Date().getTime(); //记录开始时间
    var lastprinttime = -1;
    var randomgesture = random(-100, 100);
    watch.click();
    toastLog("开始浏览视频", "forcible");
    while (true) {
      var spendTime = Math.floor((new Date().getTime() - stime) / 1000) / 60; //计算已观看时间
      var watchtime = Math.floor(spendTime);
      if (watchtime !== lastprinttime && watchtime !== 5 && watchtime !== 0) {
        toastLog(`已观看${watchtime}分钟`, "forcible");
        lastprinttime = watchtime;
      }
      sleep(randomsleep);
      gesture(
        200,
        [540 + randomgesture, 1900 + randomgesture],
        [540 + randomgesture, 1200 + randomgesture]
      );
      if (spendTime >= 5) {
        toastLog("已观看5分钟, 退出", "forcible");
        back();
        break;
      }
    }
  } else {
    toastLog("未找到'去浏览'按钮", "forcible");
  }
}

//成长值
function level() {
  button = className("android.widget.TextView")
    .text("社区成长等级")
    .findOne(1500);
  if (button) {
    button.click();
    sleep(500);
    var a = readfile("./tmp/level.txt");
    var num = className("android.widget.TextView")
      .textContains("成长值")
      .indexInParent(1)
      .findOne(3000);
    if (num) {
      var num1 = num.text().split(" ")[1].split("/")[0];
      var numValue = parseInt(num1);
      var b = numValue - a;
      log("今日获得成长值：" + b);
      toastLog("当前成长值：" + numValue, "forcible");
      files.append(
        "./tmp/level.txt",
        "\n" +
          date +
          "：+" +
          b +
          "     签到+1的概率：" +
          percentage +
          "\n" +
          numValue
      );
      sleep(500);
    } else {
      log("未找到成长值");
    }
  } else {
    log("未找到'社区成长等级'按钮");
  }
}

//小程序版成长值
function level2() {
  toastLog("开始记录小程序中成长值……", "forcible");
  let result;
  var yesterdayValue = readfile("./tmp/level.txt");
  var num = className("android.widget.TextView").text("成长值").findOne(2000);
  if (num) {
    // 当前成长值
    var currentNum = num.parent().child(1).child(0).text();
    // 本等级所需总成长值
    var num2 = num.parent().child(1).child(1).text();
    var todayValue = parseInt(currentNum);
    var num2Value = parseInt(String(num2).replace("/", ""));
    // // 今日获得成长值
    // click(num.centerX(), num.centerY());
    // sleep(1000);
    // var newdate = date.replaceAll("-", "/").substr(0, 10);
    // // 找到当天的增长记录
    // let record = className("android.widget.TextView").text(newdate).find();
    // // 今日增长总值
    // let count = 0;
    // for (i = 0; i < record.size(); i++) {
    //     let demo = record.get(i).parent().parent().child(1);
    //     var num = parseInt(demo.text().replace("+", ""));
    //     count += num;
    // }
    var diff = todayValue - yesterdayValue;
    if (yesterdayValue == 0) {
      //第一次使用脚本
      result = "第一次使用脚本，初始成长值：" + todayValue;
    } else {
      // toastLog("今日获得成长值：" + diff);
      result =
        "当前成长值：" +
        todayValue +
        "  (" +
        level段(todayValue) +
        ")" +
        "\t升级目标: " +
        num2Value +
        "\n本次执行获得: " +
        diff +
        "\t距离升级还需: " +
        (num2Value - todayValue) +
        "";
    }
    log(result);
    files.append(
      "./tmp/level.txt",
      "\n" + date + ": 本次脚本执行成长值+" + diff + "\n" + todayValue
    );
    // back();
    sleep(500);
  } else {
    log("未找到小米社区小程序中成长值");
    result = "成长值记录失败";
  }

  //关闭小程序
  toastLog("关闭小程序", "forcible");
  className("android.widget.ImageButton").desc("关闭").findOne().click();

  return result;
}

//成长值文件，返回文件中最新的成长值
function readfile(filePath) {
  if (!files.exists(filePath)) {
    files.createWithDirs(filePath); // 如果文件不存在则创建
    return 0;
  }
  var fileContent = files.read(filePath);
  if (!fileContent) return 0; // 如果文件无数据则返回0
  var lines = fileContent.split("\n");
  var lastLine = lines[lines.length - 1];
  return parseInt(lastLine);
}

// 级别划分
function level段(n) {
  if (n < 50) return "1段";
  if (n < 200) return "2段";
  if (n < 500) return "3段";
  if (n < 1000) return "4段";
  if (n < 3000) return "5段";
  if (n < 6000) return "6段";
  if (n < 15000) return "7段";
  if (n < 30000) return "8段";
  if (n < 50000) return "9段";
  return "10段";
}

//签到+1概率
function logpercentage() {
  var percentageUi = className("android.widget.TextView")
    .textContains("当前签到+1的概率:")
    .findOne(1500);
  if (percentageUi) {
    var percentageText = percentageUi.text();
    var regex = "\\d{1,3}(?:\\.\\d{1,3}?%)";
    var percentage = percentageText.match(regex)[0];
    log("当前签到成长值+1的概率:" + percentage);
    return percentage;
  } else {
    log("未找到签到成长值概率");
  }
}
//加入圈子活动
function join() {
  let qujiaru = className("android.widget.Button").text("去加入").findOne(1500);
  if (qujiaru) {
    qujiaru.click();
    let join = className("android.widget.Button")
      .text("加入圈子")
      .findOne(1500)
      .click();
    if (join) {
      toastLog("加入圈子成功", "forcible");
    } else {
      toastLog("未找到加入按钮", "forcible");
    }
    sleep(2000);
    back();
  } else {
    toastLog("未找到'加入圈子'按钮", "forcible");
  }
}

function 活动1() {
  toastLog("开始双旗舰活动", "forcible");
  let 参加 = className("android.widget.Button").text("去参加").findOne(1500);
  if (参加) {
    参加.click();
    let register = className("android.widget.Button")
      .text("立即报名")
      .findOne(1500);
    if (register) {
      sleep(500);
      let checkBox = register.parent().child(1).click();
      if (checkBox) {
        register.click();
        sleep(2000);
        let x = dwidth * 0.74;
        let y = dheight * 0.94;
        click(x, y);
        sleep(500);
      }
    }
    // 判断是否进入双旗舰页面
    let text;
    if (config.oldDevice) {
      text = className("android.view.View").text("双旗舰新征程").find(1500);
    } else {
      text = className("android.widget.TextView")
        .text("双旗舰新征程")
        .find(1500);
    }
    // toastLog("text:" + text, "forcible");
    // 输出length=1
    // toastLog("textlen:" + text.length, "forcible");
    if (text.length > 0) {
      toastLog("已经进入双旗舰主页面", "forcible");
      解锁();
    } else {
      toastLog("ERROR: 未能进入双旗舰主页面", "forcible");
    }

    sleep(500);
    back();
  } else {
    toastLog("未找到活动入口", "forcible");
  }
}

//感恩季活动
function ganenji() {
  let qucanyu = className("android.widget.Button")
    .text("去参与")
    .findOne(1500)
    .click();
  if (qucanyu) {
    sleep(500);
    解锁();
    sleep(500);
    back();
    sleep(500);
  } else {
    toastLog("未找到活动入口", "forcible");
  }
}

//  这里有bug，啥时候测试一下，可解锁的className估计不对
function 解锁() {
  let jpso;
  // 小米6x和小米14布局不同
  if (config.oldDevice) {
    jpso = className("android.view.View").text("可解锁").find();
  } else {
    jpso = className("TextView").text("可解锁").find();
  }
  let count = className("android.widget.Button")
    .text("去提升")
    .findOne(1500)
    .parent()
    .child(1)
    .text();
  toastLog("可解锁盒子数量: " + jpso.length + ", 可解锁次数: " + count, "forcible");
  if (jpso.length > 0 && count > 0) {
    for (i = 0; i < jpso.size(); i++) {
      var control = jpso.get(i);
      if (count < 1) {
        toastLog("解锁次数不足", "forcible");
        sleep(500);
        break;
      }
      control.click();
      // 解锁次数-1
      count--;
      log("第" + (i + 1) + "次解锁");
      // 多睡会
      sleep(3000);
      click(dwidth * 0.5, dheight * 0.87);
      // 显示这个字说明没有解锁次数
      let noFrequency;
      if (config.oldDevice) {
        noFrequency = className("android.view.View")
          .text("可获得1次解锁机会")
          .find();
      } else {
        noFrequency = className("android.widget.TextView")
          .text("可获得1次解锁机会")
          .find();
      }
      if (noFrequency.length > 0) {
        toastLog("解锁次数不足", "forcible");
        sleep(500);
        break;
      }
    }
  } else {
    toastLog("今日无解锁次数", "forcible");
    sleep(500);
  }
}

function 小程序签到() {
  toastLog("正在尝试打开小程序……", "forcible");

  // 当前在小米社区小程序的首页
  let xiaomiProgramIndex = className("android.widget.ImageButton")
    .desc("更多")
    .packageName("com.tencent.mm");

  //小米社区5.3以上版本，直接跳转进入小程序，并找到小米社区小程序主页
  let goMiniProgramDirect = className("android.widget.Button")
    .text("去微信")
    .findOne(1500);
  if (goMiniProgramDirect) {
    goMiniProgramDirect.click();
    sleep(1000);
    let m = 0;
    while (!xiaomiProgramIndex.exists()) {
      // 存在微信分身，选择第1个微信
      let fenshen = className("android.widget.TextView").textContains("选择");
      if (fenshen.exists()) {
        let selectFirst = className("android.widget.ImageView")
          .desc("微信")
          .findOne();
        click(selectFirst.centerX(), selectFirst.centerY());
        sleep(1000);
      }

      // 已打开微信，但未打开小米社区小程序。
      if (className("android.widget.TextView").text("通讯录").findOne(1666)) {
        toastLog("已打开微信，但未打开小程序。", "forcible");
        toastLog("开始尝试从微信进入小程序!", "long", "forcible");

        // 没进入到小米社区首页，微信下滑
        let n = 0;
        while (!xiaomiProgramIndex.exists()) {
          swipe(
            (dwidth * 1) / 2,
            (dheight * 1) / 5,
            (dwidth * 1) / 2,
            (dheight * 4) / 5,
            500
          );

          //   在最近使用的小程序中找小米社区
          let xiaomiProgramIcon = className(
            "android.widget.TextView"
          ).textContains("小米社区");
          if (!xiaomiProgramIcon.exists()) {
            className("android.widget.RelativeLayout")
              .desc("更多小程序")
              .findOne()
              .click();

            while (!xiaomiProgramIcon.exists()) {
              swipe(
                (dwidth * 1) / 2,
                (dheight * 4) / 5,
                (dwidth * 1) / 2,
                (dheight * 1) / 5,
                300
              );
              m++;
              if (m > 6) {
                sleep(500);
                toastLog("好累啊，你多久没用小米社区小程序了？", "forcible");
                toastLog("翻遍了你的小程序使用记录都没有！", "forcible");
                toastLog("老子不玩了！", "forcible");
                notice(
                  String("出错了！(" + date.substr(5, 14) + ")"),
                  String("找不到小米社区小程序！")
                );

                return;
              }
              sleep(300);
            }
          } else {
            // 找到了小米社区图标并进入
            let xiaomiProgram = xiaomiProgramIcon.findOne(2666);
            click(xiaomiProgram.centerX(), xiaomiProgram.centerY());
          }

          n++;
          log("第" + n + "尝次试！");
          sleep(600);
          if (xiaomiProgramIcon.exists() || n > 5) break;
        }
      }
      m++;
      sleep(500);
      // 进入到小米社区主页，或尝试超过10次，退出
      if (xiaomiProgramIndex.exists() || m > 10) break;
    }
  } else {
    // 不能直接从小米社区跳转微信小程序，并找到小米社区小程序主页
    home();
    sleep(200);
    home();

    toastLog("小米社区版本低于5.3.0, 不支持应用内跳转小程序，", "forcible");

    //第x屏获取小程序
    let tr = className("android.widget.ImageView").desc(
      "第" + config.screenLocal + "屏"
    );

    // 尝试寻找该组件
    for (let i = 0; i < 20; i++) {
      sleep(200);
      if (tr.findOne(1666)) {
        break;
      }
      if (i == 19) {
        toastLog("未找到第" + config.screenLocal + "屏", "forcible");
        sleep(500);
        return;
      }
    }
    tr.click();
    toastLog(
      "现在开始尝试从桌面第" + config.screenLocal + "屏寻找小程序……",
      "forcible"
    );

    // 如果没有到小米社区主页
    if (!xiaomiProgramIndex.exists()) {
      if (config.坐标点击) {
        click(config.x, config.y);
        toastLog("点击坐标进入小程序: " + config.x + "," + config.y);
        // 多延时会，防止正加载小程序呢，结果报错未找到小程序
        sleep(10000);
        xiaomiProgramIndex = className("android.widget.ImageButton")
          .desc("更多")
          .packageName("com.tencent.mm");
      }
      // 点击坐标还是没进入小程序，用第二种方法
      if (!xiaomiProgramIndex.exists()) {
        toastLog("小程序的坐标点击未成功, 尝试通过组件名称查找", "forcible");
        let xiaomiProgramIcon = className("android.widget.ImageView")
          .desc("小米社区")
          .findOne(1666);
        if (!xiaomiProgramIcon) {
          xiaomiProgramIcon = className("android.widget.TextView")
            .text("小米社区")
            .findOne(1666);
        }
        // 如果没有找到小米小程序组件
        if (!xiaomiProgramIcon) {
          toastLog(
            "没有在第" + config.screenLocal + "屏找到小米社区微信小程序,",
            "forcible"
          );
          toastLog(
            "请在微信小程序中，点击右上角，选择'添加到桌面',",
            "forcible"
          );
          toastLog("然后将图标移动到第3屏。", "forcible");
          toastLog("(或者告诉我小程序图标(第3屏)的坐标，", "forcible");
          toastLog(
            "(将配置文件中的'坐标点击'改成1,然后设置x、y坐标。)",
            "forcible"
          );
          toastLog("现在跳过小米社区微信小程序签到……", "forcible");
          return;
        } else {
          toastLog("通过组件名找到小米社区，进入", "forcible");
          click(xiaomiProgramIcon.centerX(), xiaomiProgramIcon.centerY());
          toastLog("点击小米社区", "forcible");
          // 小程序进的有点慢，多延时会
          sleep(4000);
        }
      }
    }
  }

  sleep(1000);
  // 还是没到小米社区首页，放弃
  if (!xiaomiProgramIndex.exists()) {
    toastLog("进不了微信小程序，我尽力了！", "long", "forcible");
    notice(
      String("出错了！(" + date.substr(5, 14) + ")"),
      String("进不了微信小程序，我尽力了！")
    );
    return;
  } else {
    // 进入小米社区成功
    toastLog("成功打开小程序", "forcible");
    let me = className("android.widget.TextView").text("我的").findOne();
    click(me.centerX(), me.centerY());
    sleep(1000);
    toastLog("开始进入我的页面", "forcible");
    let edit = text("编辑资料");
    let cont = 0;
    while (!edit.exists()) {
      log("尚未进入我的页面");
      click(me.centerX(), me.centerY());

      // click(dwidth*3/4,dheight*0.96)
      // 适当睡眠，防止页面还没打开
      sleep(1000);
      cont++;
      if (cont > 5) {
        toastLog("已经进入小米社区小程序，但未找到我的页面", "forcible");
        return;
      }
    }
    let qd = className("android.widget.TextView").text("去签到");
    let finish = className("android.widget.TextView").text("已签到");
    if (qd.exists()) {
      let qd1 = qd.findOne();
      click(qd1.centerX(), qd1.centerY());
      sleep(1000);
      toastLog("小程序签到成功", "forcible");
    } else if (finish.exists()) {
      toastLog("小程序已签到", "forcible");
    } else {
      toastLog("ERROR: 小程序签到失败，未找到去签到按钮", "forcible");
    }
  }
}
//跳过广告
function skipAd() {
  let adCloseBtn = className("android.widget.ImageView")
    .desc("关闭")
    .findOne(1500);
  if (adCloseBtn) {
    adCloseBtn.click();
    log("跳过了广告");
  }
}

function clickcenter(obj) {
  let x = obj.centerX();
  let y = obj.centerY();
  //log(x,y)
  click(x, y);
}

function randomDelay(min, max) {
  // 生成一个指定范围内的随机整数
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay;
}

//随即延时，再执行脚本，防止每天固定时间执行
function delayRun() {
  if (config.delayRun) {
    const delay = randomDelay(0, config.delayTime * 60000);
    toastLog("随机延迟: " + delay / 1000 + "秒后执行脚本", "forcible");
    sleep(delay);
  }
}
//运行时间
function countRunTime() {
  threads.start(function () {
    starttime = new Date().getTime();
    setInterval(
      function (time) {
        endtime = new Date().getTime();
        let runtime = Math.floor((endtime - time) / 1000);
        //log("运行时间：" + runtime + "秒");
        if (runtime >= config.totaltime) {
          log("定时结束");
          device.cancelKeepingAwake();
          exit();
        }
      },
      10000,
      starttime
    );
  });
}

function start() {
  var done = textContains("已签到").findOne(1500);
  if (!done) findCenter();
  toastLog("今日已签到", "forcible");
}

// 单元用例
function test() {
  // 回到APP首页
  // backAppIndex();

  sleep(1000);

  // let xmsqAPP = className("android.widget.ImageView").desc("签到").packageName("com.xiaomi.vipaccount");
  //let xmsqAPP = className("android.widget.TextView").text("官方").packageName("com.xiaomi.vipaccount").findOne();
  //let czz = className("android.widget.TextView").text("编辑资料");
  //let czz = text("编辑资料");
  //if(czz) click(czz.bounds().centerX(), czz.bounds().centerY());;
  //let yyxx = text("强行停止");
  //let yyxx = className("android.widget.TextView").text("结束运行");
  //let yyxx = className("android.widget.LinearLayout").desc("结束运行");
  // let pkly = className("android.widget.ImageView").desc("评论").findOne(888);

  // let tiezi = pkly.parent().parent();
  // click(tiezi.centerX() * 0.95, tiezi.centerY() * 0.9);
  //sleep(700)
  // let gz = className("android.widget.TextView").text("关注");
  //let bc = className("android.widget.TextView").text("保存");

  // let sign = className("android.widget.ImageView").desc("签到").findOne(3000).click();
  var start = new Date().getTime();

  let done = className("android.widget.TextView").text("保存");
  //className("android.widget.Button").text("后退");
  //text("关注").findOne(2600);

  // var done = className("android.widget.TextView").text("已签到");
  if (done.exists()) {
    toastLog(true);

    log(done);
  } else toastLog(false);
  var time = new Date().getTime() - start;

  toastLog(time, "forcible");
  notice("结束啦！", String(time));
  exit();
}

//主程序
function main() {
  var xmPckageName = "com.xiaomi.vipaccount";

  if (!device.isScreenOn()) {
    log("设备已锁定");
    while (!device.isScreenOn()) {
      device.wakeUp();
      sleep(100);
    }
    sleep(500);
    unLock();
  }
  device.keepScreenOn(3600 * 1000);
  let musicVolume = device.getMusicVolume();
  //关掉声音
  //device.setMusicVolume(0);

  killAPP(xmPckageName);
  // 1.打开小米社区app，完成签到，浏览等功能
  if (launchAPP(xmPckageName)) {
    skipAd();
    if (config.浏览帖子) posts(1);
    let sign = className("android.widget.ImageView")
      .desc("签到")
      .findOne(3000)
      .click();
    if (sign) {
      toastLog("打开小米社区app的签到页面", "forcible");
      sleep(500);
      // 记录成长值为1的概率
      percentage = logpercentage();
      // 签到
      start();
      // 按配置启用功能
      if (config.双旗舰) 活动1();
      if (config.加入圈子) join();
      //       if (config.感恩季) ganenji();
      if (config.拔萝卜) see();
      //        if (config.米粉节) fans();
      //        if (config.观看视频) watchVideo();
    }
  } else {
    sleep(500);
    toastLog("(*꒦ິ⌓꒦ີ) 为什么我打不开小米社区APP?", "forcible");
    toastLog("哪里出错了？", "forcible");
    notice(
      String("出错了！(" + date.substr(5, 14) + ")"),
      String("芭比Q了, 小米社区里的操作都没完成。")
    );
  }
  // 2.打开微信小程序，完成签到
  let text;
  if (config.小程序签到) {
    小程序签到();
  }
  if (config.成长值记录) {
    text = level2();
  }
  //notice('签到完成', '操作全部完成！');
  if (typeof text === "undefined") {
    text =
      "未获取到成长值数据！ 建议如下操作后重试：\n1、“最近任务”杀死小程序。2、重启AutoJs6“无障碍权限。";
  }
  // 3.任务完成，记录并退回到主界面
  killAPP(xmPckageName);
  home();
  sleep(200);
  home();
  notice(String("全部操作已完成(" + date.substr(5, 14) + ")"), String(text));
  toastLog("全部操作已完成", "forcible");

  //device.setMusicVolume(musicVolume);
  // 4.取消屏幕常亮，让手机自动休眠
  device.keepScreenOn(1);
  device.cancelKeepingAwake();

  // 5.点击桌面一键锁屏按钮
  if (config.lockScreen) {
    sleep(200);
    click(config.lockX, config.lockY);
  }

  try {
    exit();
  } catch (e) {
    // Ignored.
    toastLog("exit()失败" + e, "forcible");
  }
  return;
}
