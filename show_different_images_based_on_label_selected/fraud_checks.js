/*
Objective:
Display different example check images at the bottom of the layout 
depending on the class label selected
*/

const IMG_ID = 'img_uniq'
// TODO: use your own keys and values here for label lookup and data objects to display
const images = {
  'Addressee': '/storage-data/uploaded/?filepath=upload/86849/f7bce1e6-addressee.jpg',
  'Account number': '/storage-data/uploaded/?filepath=upload/86849/f3fe2182-account-routing-number.png',
  'Routing number': '/storage-data/uploaded/?filepath=upload/86849/f3fe2182-account-routing-number.png',
  'Signature': '/storage-data/uploaded/?filepath=upload/86849/6926d68d-sign.jpg',
  'Amount': '/storage-data/uploaded/?filepath=upload/86849/d8bf4fac-amount.jpg',
  'Watermark': '/storage-data/uploaded/?filepath=upload/86849/695ba9b9-watermark.png',
  'Date': '/storage-data/uploaded/?filepath=upload/86849/afc3193a-date.png',
  'Correction': '/storage-data/uploaded/?filepath=upload/86849/d2c0218b-correction.jpg',
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
  // hardcoded access to rendered labels,
  // if you will have more Labels in a future adjust the logic
  document.querySelectorAll('.lsf-label_clickable').forEach(
    (lbl, index) => lbl.addEventListener('click', () => {
      const src = images[labels[index].value]
      // if there are no images with this key image will just have an empty src
      imageEl.src = src
    })
  )
}

appendCheckImg();
