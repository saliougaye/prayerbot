const DEFAULT_MESSAGE = require('./messages')


const keyboard = [
    [DEFAULT_MESSAGE.KEYBOARD_TEXT.TODAY], 
    [DEFAULT_MESSAGE.KEYBOARD_TEXT.TOMORROW], 
    [DEFAULT_MESSAGE.KEYBOARD_TEXT.CHANGE_CITY]
]


const reply_markup = {
    keyboard
}


module.exports = reply_markup;