// ==UserScript==
// @name         导出微信公众号文章为 PDF
// @namespace    https://github.com/ezyshu/scripts
// @version      0.5
// @author       ezyshu
// @description  在微信公众号文章页面中添加按钮，点击后导出文章为 PDF 格式，并显示标题、作者和时间等元信息。
// @match        https://mp.weixin.qq.com/s/*
// @grant        none
// @license      Apache-2.0 license
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js
// ==/UserScript==

(function () {
  'use strict';

  // 创建一个按钮
  var button = document.createElement('button');
  button.innerHTML = '导出为 PDF';
  button.style.position = 'fixed';
  button.style.top = '10px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.cursor = 'pointer';
  button.style.transition = 'background-color 0.3s ease'; // 添加过渡效果
  document.body.appendChild(button);

  // 标志位：防止连续多次点击
  let isExporting = false;

  // 添加加载动画
  function startLoading() {
    button.disabled = true; // 禁用按钮
    button.style.backgroundColor = '#888'; // 变成灰色表示加载中
    button.innerHTML = '正在导出...'; // 更改按钮文本为加载状态
  }

  // 停止加载动画
  function stopLoading() {
    button.disabled = false; // 启用按钮
    button.style.backgroundColor = '#4CAF50'; // 恢复原始颜色
    button.innerHTML = '导出为 PDF'; // 恢复按钮文本
  }

  // 点击按钮时执行导出 PDF 的操作
  button.addEventListener('click', function () {
    if (isExporting) {
      return; // 如果已经在导出过程中，则不允许再次点击
    }

    isExporting = true; // 设置为正在导出
    startLoading(); // 启动加载动画

    // 获取文章内容和标题、作者、时间等元信息
    var article = document.querySelector('.rich_media_content');
    var title = document.querySelector('.rich_media_title');
    var author = document.querySelector('.weui-wa-hotarea'); // 文章作者
    var publishTime = document.querySelector('#publish_time'); // 文章时间

    if (article) {
      // 创建一个容器用于添加元信息
      var metaInfoDiv = document.createElement('div');
      metaInfoDiv.style.marginBottom = '20px';
      metaInfoDiv.style.borderBottom = '1px solid #eee';
      metaInfoDiv.style.paddingBottom = '15px';

      // 标题
      var titleElement = document.createElement('h1');
      titleElement.innerText = title ? title.innerText.trim() : '未命名文章';
      titleElement.style.fontSize = '24px';
      titleElement.style.marginBottom = '10px';
      metaInfoDiv.appendChild(titleElement);

      // 作者
      if (author) {
        var authorElement = document.createElement('p');
        authorElement.innerText = '作者：' + author.innerText.trim();
        authorElement.style.fontSize = '14px';
        authorElement.style.margin = '5px 0';
        metaInfoDiv.appendChild(authorElement);
      }

      // 时间
      if (publishTime) {
        var timeElement = document.createElement('p');
        timeElement.innerText = '发布时间：' + publishTime.innerText.trim();
        timeElement.style.fontSize = '14px';
        timeElement.style.margin = '5px 0';
        metaInfoDiv.appendChild(timeElement);
      }

      // 将元信息插入到文章内容的顶部
      article.insertBefore(metaInfoDiv, article.firstChild);

      // 添加防止图片分页的 CSS 样式
      var style = document.createElement('style');
      style.innerHTML = `
        .rich_media_content img {
          page-break-inside: avoid;
          break-inside: avoid;
          max-width: 100%;
          height: auto;
        }
        .rich_media_content p, .rich_media_content div {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      `;
      document.head.appendChild(style);

      // 确保所有图片加载完成
      let images = article.querySelectorAll('img');
      let imagePromises = [];

      images.forEach(function (img) {
        // 处理懒加载的图片，确保图片的真实 URL 被加载
        if (img.dataset && img.dataset.src) {
          img.src = img.dataset.src;
        }

        // 通过跨域获取图片，并将图片转换为 base64 格式
        imagePromises.push(
          new Promise(function (resolve) {
            var imgElement = new Image();
            imgElement.crossOrigin = 'Anonymous';
            imgElement.src = img.src;
            imgElement.onload = function () {
              var canvas = document.createElement('canvas');
              canvas.width = imgElement.width;
              canvas.height = imgElement.height;
              var ctx = canvas.getContext('2d');
              ctx.drawImage(imgElement, 0, 0);
              img.src = canvas.toDataURL('image/jpeg'); // 使用 JPEG 格式并压缩质量到 70%
              resolve();
            };
            imgElement.onerror = resolve; // 即使图片加载失败，继续处理
          })
        );
      });

      // 确保图片加载完成后再导出 PDF
      Promise.all(imagePromises).then(function () {
        // 使用文章标题作为文件名
        var fileName = title ? title.innerText.trim() + '.pdf' : 'WeChat_Article.pdf';

        var opt = {
          margin: 0.5,
          filename: fileName,
          image: {
            type: 'jpeg',
            quality: 1 // 降低图片质量以减小 PDF 体积
          },
          html2canvas: {
            scale: 1.5, // 降低渲染比例以减小 PDF 体积
            useCORS: true, // 允许跨域图片
            logging: false, // 关闭日志
            // 可以根据需要添加其他 html2canvas 选项
          },
          jsPDF: {
            unit: 'in',
            format: 'a4', // 使用 A4 格式，比 letter 更常用且体积可能更小
            orientation: 'portrait'
          },
          pagebreak: {
            mode: ['avoid-all', 'css', 'legacy']
          } // 遵循 CSS 中的 page-break 规则
        };

        // 使用 html2pdf 将文章内容导出为 PDF
        html2pdf().from(article).set(opt).save().then(function () {
          // 导出完成后，恢复按钮状态
          stopLoading();
          isExporting = false; // 重置导出状态
        }).catch(function (error) {
          alert('导出过程中出现问题：' + error.message);
          stopLoading(); // 即使出现错误也恢复按钮状态
          isExporting = false; // 重置导出状态
        });
      }).catch(function (error) {
        alert('处理图片时出现问题：' + error.message);
        stopLoading(); // 即使出现错误也恢复按钮状态
        isExporting = false; // 重置导出状态
      });
    } else {
      alert('未找到文章内容');
      stopLoading(); // 如果未找到文章内容，恢复按钮状态
      isExporting = false; // 重置导出状态
    }
  });
})();