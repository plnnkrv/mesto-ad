import '../pages/index.css';

import { createCard, updateLike, removeCard, handleLikeClick } from './components/card.js';
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard,
} from './components/api.js';

const placesList = document.querySelector('.places__list');
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');

const editProfileModal = document.querySelector('.popup_type_edit');
const addCardModal = document.querySelector('.popup_type_new-card');
const imageModal = document.querySelector('.popup_type_image');
const avatarModal = document.querySelector('.popup_type_edit-avatar');
const cardInfoModal = document.querySelector('.popup_type_info');

const editForm = document.forms['edit-profile'];
const addForm = document.forms['new-place'];
const avatarForm = document.forms['edit-avatar'];

const nameInput = editForm.elements['user-name'];
const jobInput = editForm.elements['user-description'];
const placeNameInput = addForm.elements['place-name'];
const placeLinkInput = addForm.elements['place-link'];
const avatarInput = avatarForm.elements['user-avatar'];

const modalImage = imageModal.querySelector('.popup__image');
const modalCaption = imageModal.querySelector('.popup__caption');

const cardInfoTitle = cardInfoModal.querySelector('.popup__title');
const cardInfoList = cardInfoModal.querySelector('.popup__info');
const cardInfoUserList = cardInfoModal.querySelector('.popup__list');
const cardInfoHeading = cardInfoModal.querySelector('.popup__text');

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
};

enableValidation(validationConfig);

let currentUserId = null;

function renderLoading(button, isLoading, loadingText, originalText) {
  button.textContent = isLoading ? loadingText : originalText;
  button.disabled = isLoading;
}

const formatDate = (date) =>
  date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

function clearElement(element) {
  element.innerHTML = '';
}

function openImageModal(data) {
  modalImage.src = data.link;
  modalImage.alt = data.name;
  modalCaption.textContent = data.name;
  openModalWindow(imageModal);
}

function createInfoItem(term, description) {
  const template = document.getElementById('popup-info-definition-template');
  const item = template.content.querySelector('.popup__info-item').cloneNode(true);
  item.querySelector('.popup__info-term').textContent = term;
  item.querySelector('.popup__info-description').textContent = description;
  return item;
}

function createUserBadge(user) {
  const template = document.getElementById('popup-info-user-preview-template');
  const item = template.content.querySelector('.popup__list-item').cloneNode(true);
  item.textContent = user.name;
  return item;
}

function handleInfoClick(cardId) {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) return;

      cardInfoTitle.textContent = 'Информация о карточке';
      cardInfoList.innerHTML = '';
      cardInfoUserList.innerHTML = '';

      cardInfoList.append(
        createInfoItem('Описание:', cardData.name),
        createInfoItem('Дата создания:', formatDate(new Date(cardData.createdAt))),
        createInfoItem('Владелец:', cardData.owner.name),
        createInfoItem('Количество лайков:', String(cardData.likes.length))
      );

      cardInfoHeading.textContent = cardData.likes.length > 0 ? 'Лайкнули:' : '';
      cardData.likes.forEach((user) => {
        cardInfoUserList.append(createUserBadge(user));
      });

      openModalWindow(cardInfoModal);
    })
    .catch((err) => console.log(err));
}

function handleDeleteCard(cardElement, cardId) {
  deleteCard(cardId)
    .then(() => {
      removeCard(cardElement);
    })
    .catch((err) => console.log(err));
}

function renderCard(cardData, userId, method = 'append') {
  const cardElement = createCard(cardData, userId, {
    onPreviewPicture: openImageModal,
    onDeleteCard: handleDeleteCard,
    onLikeCard: (likeButton, likeCount, cardId) => handleLikeClick(likeButton, likeCount, cardId),
    onInfoClick: handleInfoClick,
  });
  placesList[method](cardElement);
}


function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const submitButton = editForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  renderLoading(submitButton, true, 'Сохранение...', originalText);

  setUserInfo({ name: nameInput.value, about: jobInput.value })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(editProfileModal);
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(submitButton, false, 'Сохранение...', originalText));
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  renderLoading(submitButton, true, 'Сохранение...', originalText);

  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileImage.style.backgroundImage = `url('${userData.avatar}')`;
      // avatarForm.reset(); // УДАЛЕНО – очистка выполняется при открытии
      closeModalWindow(avatarModal);
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(submitButton, false, 'Сохранение...', originalText));
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitButton = addForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  renderLoading(submitButton, true, 'Создание...', originalText);

  addCard({ name: placeNameInput.value, link: placeLinkInput.value })
    .then((newCard) => {
      renderCard(newCard, currentUserId, 'prepend');
      // addForm.reset(); // УДАЛЕНО
      // clearValidation(addForm, validationConfig); // УДАЛЕНО
      closeModalWindow(addCardModal);
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(submitButton, false, 'Создание...', originalText));
}


document.querySelector('.profile__edit-button').addEventListener('click', () => {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDescription.textContent;
  clearValidation(editForm, validationConfig);
  openModalWindow(editProfileModal);
});

document.querySelector('.profile__add-button').addEventListener('click', () => {
  addForm.reset();
  clearValidation(addForm, validationConfig);
  openModalWindow(addCardModal);
});

profileImage.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarModal);
});

editForm.addEventListener('submit', handleEditProfileSubmit);
addForm.addEventListener('submit', handleAddCardSubmit);
avatarForm.addEventListener('submit', handleAvatarSubmit);

const allPopups = [editProfileModal, addCardModal, imageModal, avatarModal, cardInfoModal];
allPopups.forEach((popup) => setCloseModalWindowEventListeners(popup));

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileImage.style.backgroundImage = `url('${userData.avatar}')`;
    cards.forEach((card) => renderCard(card, currentUserId));
  })
  .catch((err) => console.log(err));
