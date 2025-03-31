/**
 * Display different example check images at the bottom of the layout
 * depending on the class label selected
 */

const IMG_ID = 'img_uniq'
// TODO: use your own keys and values here for label lookup and data objects to display
const imagesRoot = '/static/custom-scripts/custom-scripts/different-images-per-label/img'
const images = {
  'Addressee': `${imagesRoot}/demo-addressee.jpg`,
  'Account number': `${imagesRoot}/demo-routing-number.png`,
  'Routing number': `${imagesRoot}/demo-routing-number.png`,
  'Signature': `${imagesRoot}/demo-sign.jpg`,
  'Amount': `${imagesRoot}/demo-amount.jpg`,
  'Watermark': `${imagesRoot}/demo-watermark.png`,
  'Date': `${imagesRoot}/demo-date.png`,
  'Correction': `${imagesRoot}/demo-correction.jpg`,
}

function appendCheckImg() {
  let imageEl = window[IMG_ID]
  if (!imageEl) {
  	imageEl = document.createElement('img');
    imageEl.id = IMG_ID

  	const labelingInterface = document.querySelector('.lsf-main-view__annotation');
    if (labelingInterface) {
    	labelingInterface.insertAdjacentElement('beforeend', imageEl);
    } else {
    	console.error('Labeling interface element not found.');
    }
  }

  // `label` is an actual tag name from config
  const labels = LSI.annotation.names.get('label').children

  // If you will have more Labels in a future adjust the logic
  document.querySelectorAll('.lsf-label_clickable').forEach(
    (lbl, index) => lbl.addEventListener('click', () => {
      const src = images[labels[index].value]

      // if there are no images with this key image will just have an empty src
      imageEl.src = src
    })
  )
}

appendCheckImg();
