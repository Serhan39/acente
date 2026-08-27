(function () {
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var ICONS = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.47 1.33 4.98L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.55 2 12.04 2zm5.83 14.24c-.25.7-1.24 1.28-2.02 1.45-.54.11-1.24.2-3.6-.77-2.9-1.2-4.77-4.15-4.92-4.35-.14-.2-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.86 2.08.93 2.23.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.45.54-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.08.13.08.75-.17 1.45z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 6c0-1.1-.9-2-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V6z"/><path d="m22 6-10 7L2 6"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
  };

  var MARK = '<svg class="mark" viewBox="0 0 200 200" aria-hidden="true">' +
    '<path d="M40 100a60 60 0 0 1 120 0" stroke="#16181A" stroke-width="18" fill="none" stroke-linecap="round"/>' +
    '<circle cx="100" cy="105" r="40" fill="#2CA9D6"/>' +
    '<circle cx="100" cy="105" r="22" fill="#16181A"/>' +
    '<circle cx="111" cy="94" r="6" fill="white"/>' +
    '<path d="M55 128a55 55 0 0 0 100 0" stroke="#7FB539" stroke-width="16" fill="none" stroke-linecap="round"/>' +
    '</svg>';

  window.TechburdaCard = {
    mark: MARK,

    // data: {name, orgHtml, phone, phoneDisplay, email, website, websiteDisplay, instagram, instagramDisplay, vcf}
    render: function (data) {
      var rows = '';
      rows += '<a class="row" href="tel:' + esc(data.phone) + '">' +
        '<span class="icon">' + ICONS.phone + '</span>' +
        '<span class="text"><span class="label">Telefon</span><span class="value">' + esc(data.phoneDisplay) + '</span></span></a>';
      rows += '<a class="row" href="mailto:' + esc(data.email) + '">' +
        '<span class="icon">' + ICONS.mail + '</span>' +
        '<span class="text"><span class="label">E-posta</span><span class="value">' + esc(data.email) + '</span></span></a>';
      if (data.website) {
        rows += '<a class="row" href="' + esc(data.website) + '" target="_blank" rel="noopener">' +
          '<span class="icon">' + ICONS.globe + '</span>' +
          '<span class="text"><span class="label">Web Sitesi</span><span class="value">' + esc(data.websiteDisplay || data.website) + '</span></span></a>';
      }
      if (data.instagram) {
        rows += '<a class="row" href="' + esc(data.instagram) + '" target="_blank" rel="noopener">' +
          '<span class="icon">' + ICONS.instagram + '</span>' +
          '<span class="text"><span class="label">Instagram</span><span class="value">' + esc(data.instagramDisplay || '') + '</span></span></a>';
      }

      var html = '<div class="card">' +
        '<div class="header">' + MARK +
        '<h1>' + esc(data.name) + '</h1>' +
        '<p class="org">' + (data.orgHtml || esc(data.org || '')) + '</p>' +
        '</div>' +
        '<div class="actions">' +
        '<a class="action call" href="tel:' + esc(data.phone) + '">' + ICONS.phone + 'Ara</a>' +
        '<a class="action whatsapp" href="https://wa.me/' + esc((data.whatsapp || data.phone).replace(/\D/g, '')) + '" target="_blank" rel="noopener">' + ICONS.whatsapp + 'WhatsApp</a>' +
        '<a class="action mail" href="mailto:' + esc(data.email) + '">' + ICONS.mail + 'E-posta</a>' +
        '<a class="action share" href="#" id="shareBtn">' + ICONS.share + 'Paylaş</a>' +
        '</div>' +
        '<div class="list">' + rows + '</div>' +
        (data.vcf ? '<a class="cta" href="' + esc(data.vcf) + '" download>Rehbere Ekle</a>' : '') +
        '<div class="qr-wrap"><img id="qrImg" alt="Kartvizit QR kodu" width="84" height="84">' +
        '<div class="qr-text"><b>Karekodu okutun</b>Bu sayfayı anında telefonunuza açmak için kamerayla okutmanız yeterli.</div></div>' +
        '<footer>Dijital Kartvizit · ' + (data.org ? esc(data.org) : esc(data.name)) + '</footer>' +
        '</div>';

      document.getElementById('app').innerHTML = html;

      var url = window.location.href;
      var qrImg = document.getElementById('qrImg');
      if (qrImg) {
        qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=' + encodeURIComponent(url);
      }

      var shareBtn = document.getElementById('shareBtn');
      if (shareBtn) {
        shareBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (navigator.share) {
            navigator.share({ title: data.name, text: 'Dijital kartvizitim', url: url }).catch(function () {});
          } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function () {
              alert('Bağlantı kopyalandı: ' + url);
            });
          } else {
            window.prompt('Bağlantıyı kopyalayın:', url);
          }
        });
      }
    }
  };
})();
