const getTemplate = () => {
  return document
    .getElementById('card-template')
    .content.querySelector('.card')
    .cloneNode(true);
};

export const updateLike = (likeButton, likeCount, likesNumber) => {
  likeButton.classList.toggle('card__like-button_is-active');
  likeCount.textContent = likesNumber;
};

export const removeCard = (cardElement) => {
  cardElement.remove();
};

export const createCard = (data, userId, { onPreviewPicture, onDeleteCard, onLikeCard, onInfoClick }) => {
  const cardElement = getTemplate();
  const cardImage = cardElement.querySelector('.card__image');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const infoButton = cardElement.querySelector('.card__control-button_type_info');

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector('.card__title').textContent = data.name;
  likeCount.textContent = data.likes.length;

  if (data.likes.some((user) => user._id === userId)) {
    likeButton.classList.add('card__like-button_is-active');
  }

  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', () => onDeleteCard(cardElement, data._id));
  }

  likeButton.addEventListener('click', () => onLikeCard(likeButton, likeCount, data._id));
  cardImage.addEventListener('click', () => onPreviewPicture(data));
  infoButton.addEventListener('click', () => onInfoClick(data._id));

  return cardElement;
};