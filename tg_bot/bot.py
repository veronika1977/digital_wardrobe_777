import asyncio
import logging
import backend_client

from dotenv import load_dotenv
import os
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, Command
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.client.session.aiohttp import AiohttpSession
from aiohttp import BasicAuth
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from aiogram.types import CallbackQuery, WebAppInfo
from datetime import datetime
import pytz

# --- Конфигурация ---
load_dotenv()

WEB_APP_URL = os.getenv("WEB_APP_URL")
TOKEN = os.getenv("BOT_TOKEN")
MINI_APP_URL = os.getenv("MINI_APP_URL")
DAILY_OUTFIT_URL = os.getenv("DAILY_OUTFIT_URL")
logging.basicConfig(level=logging.INFO)

dp = Dispatcher()
scheduler = AsyncIOScheduler()


# --- Хэндлер: /start ---
@dp.message(CommandStart())
async def command_start_handler(message: types.Message):
    user_name = message.from_user.first_name or "друг"

    await backend_client.register_user(
        str(message.from_user.id), 
        message.from_user.username or "", 
        user_name
    )

    welcome_text = (
        f"Привет, {user_name}! 👋\n\n"
        "Добро пожаловать в твой цифровой гардероб.\n\n"
        "Здесь ты можешь:\n"
        "• хранить свои вещи\n"
        "• создавать стильные образы\n"
        "• быстро подбирать луки\n\n"
        "Нажми кнопку ниже, чтобы открыть приложение."
    )

    builder = InlineKeyboardBuilder()
    builder.row(
        types.InlineKeyboardButton(
            text="Открыть гардероб",
            url=WEB_APP_URL
        )
    )

    await message.answer(
        welcome_text,
        reply_markup=builder.as_markup()
    )


@dp.message(Command("wardrobe"))
async def command_wardrobe_handler(message: types.Message):
    text = "Твой гардероб всегда под рукой! Нажми на кнопку ниже, чтобы заглянуть внутрь 👇"
    
    builder = InlineKeyboardBuilder()
    builder.row(
        types.InlineKeyboardButton(
            text="Открыть гардероб",
            url=WEB_APP_URL
        )
    )
    
    await message.answer(text, reply_markup=builder.as_markup())


@dp.message(Command("help"))
async def command_help_handler(message: types.Message):
    help_text = (
        "🤖 **Доступные команды:**\n"
        "/start — Перезапустить бота и получить приветствие\n"
        "/wardrobe — Быстрая ссылка для открытия гардероба\n"
        "/settings — Настройки профиля\n"
        "/help — Показать это меню помощи\n\n"
 )
    await message.answer(help_text, parse_mode="Markdown")


@dp.message(Command("settings"))
async def command_settings_handler(message: types.Message):
    """Показывает меню настроек с кнопками"""
    settings_text = (
        "⚙️ **Настройки уведомлений**\n\n"
        "Выберите действие:"
    )
    
    builder = InlineKeyboardBuilder()
    builder.row(
        types.InlineKeyboardButton(text="🔔 Включить", callback_data="enable_notifications"),
        types.InlineKeyboardButton(text="🔕 Отключить", callback_data="disable_notifications")
    )
    builder.row(
        types.InlineKeyboardButton(text="⏰ Установить время", callback_data="set_time")
    )
    
    await message.answer(settings_text, reply_markup=builder.as_markup(), parse_mode="Markdown")


@dp.callback_query(lambda c: c.data == "enable_notifications")
async def callback_enable_notifications(callback: CallbackQuery):
    """Включает уведомления"""
    user_id = str(callback.from_user.id)
    await backend_client.update_settings(user_id, enabled=True)
    await callback.message.edit_text(
        "✅ **Уведомления включены!**",
        parse_mode="Markdown"
    )
    await callback.answer()


@dp.callback_query(lambda c: c.data == "disable_notifications")
async def callback_disable_notifications(callback: CallbackQuery):
    """Выключает уведомления"""
    user_id = str(callback.from_user.id)
    await backend_client.update_settings(user_id, enabled=False)
    await callback.message.edit_text(
        "❌ **Уведомления выключены**",
        parse_mode="Markdown"
    )
    await callback.answer()


@dp.callback_query(lambda c: c.data == "set_time")
async def callback_set_time(callback: CallbackQuery):
    """Показывает меню выбора времени (24 часа)"""
    settings_text = "⏰ **Выберите время для уведомлений:**\n\n"
    
    builder = InlineKeyboardBuilder()
    
    builder.row(
        types.InlineKeyboardButton(text="🧪 Проверить сейчас", callback_data="test_now")
    )

    for hour in range(24):
        button_text = f"{hour:02d}:00"
        builder.button(text=button_text, callback_data=f"time_{hour}")

    builder.adjust(2)

    builder.row(
        types.InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_settings")
    )
    
    await callback.message.edit_text(settings_text, reply_markup=builder.as_markup(), parse_mode="Markdown")
    await callback.answer()


@dp.callback_query(lambda c: c.data.startswith("time_"))
async def callback_time_selected(callback: CallbackQuery):
    """Обрабатывает выбор конкретного часа"""
    hour = int(callback.data.split("_")[1])
    user_id = str(callback.from_user.id)
    
    await backend_client.update_settings(user_id, enabled=True, hour=hour)
    
    await callback.message.edit_text(
        f"✅ **Время уведомлений установлено на {hour:02d}:00**.",
        parse_mode="Markdown"
    )
    await callback.answer()


@dp.callback_query(lambda c: c.data == "back_to_settings")
async def callback_back_to_settings(callback: CallbackQuery):
    """Возвращает в главное меню настроек"""
    settings_text = (
        "⚙️ **Настройки уведомлений**\n\n"
        "Выберите действие:"
    )
    
    builder = InlineKeyboardBuilder()
    builder.row(
        types.InlineKeyboardButton(text="✅ Включить уведомления", callback_data="enable_notifications"),
        types.InlineKeyboardButton(text="❌ Выключить уведомления", callback_data="disable_notifications")
    )
    builder.row(
        types.InlineKeyboardButton(text="⏰ Установить время", callback_data="set_time")
    )
    
    await callback.message.edit_text(settings_text, reply_markup=builder.as_markup(), parse_mode="Markdown")
    await callback.answer()

async def send_daily_notification(bot: Bot, current_hour: int = 19):

    users = await backend_client.get_users_to_notify(hour=current_hour)
    
    notification_text = (
        "🔔 Вы не отметили одежду, которую носили сегодня. Это можно сделать тут 👇"
    )
    
    builder = InlineKeyboardBuilder()
    builder.row(
        types.InlineKeyboardButton(
            text="📝 Отметить, что носили сегодня",
            web_app=WebAppInfo(url=f"{MINI_APP_URL}?action=wear_today")
        )
    )
    keyboard = builder.as_markup()

    sent_count = 0
    for user in users:
        try:
            await bot.send_message(user["telegram_id"], notification_text, parse_mode="Markdown", reply_markup=keyboard)
            sent_count += 1
            await asyncio.sleep(0.1) 
        except Exception as e:
            logging.error(f"Не удалось отправить уведомление пользователю {user.get('telegram_id')}: {e}")
    
    logging.info(f"Отправлено уведомлений: {sent_count}")

async def send_hourly_notification(bot: Bot):
    """Проверяет каждый час и отправляет уведомления нужным пользователям"""
    from datetime import datetime
    
    moscow_tz = pytz.timezone('Europe/Moscow')
    current_hour = datetime.now(moscow_tz).hour
    
    users = await backend_client.get_users_to_notify(hour=current_hour)
    
    if not users:
        logging.info(f"В {current_hour}:00 нет пользователей для уведомлений")
        return
    
    notification_text = (
        "🔔 Вы не отметили одежду, которую носили сегодня. Это можно сделать тут 👇"
    )
    
    builder = InlineKeyboardBuilder()
    builder.row(
        types.InlineKeyboardButton(
            text="📝 Отметить, что носили сегодня",
            web_app=WebAppInfo(url=f"{MINI_APP_URL}?action=wear_today")
        )
    )
    keyboard = builder.as_markup()

    sent_count = 0
    for user in users:
        try:
            await bot.send_message(
                user["telegram_id"],
                notification_text,
                reply_markup=keyboard
            )
            sent_count += 1
            await asyncio.sleep(0.1)
        except Exception as e:
            logging.error(f"Не удалось отправить уведомление: {e}")
    
    logging.info(f"В {current_hour}:00 отправлено уведомлений: {sent_count}")


@dp.message(Command("test"))
async def command_test_broadcast(message: types.Message):
    """Тестовая команда для проверки рассылок"""
    await message.answer("⏳ Запускаю тестовую рассылку...")
    await send_daily_notification(message.bot, current_hour=19)
    await message.answer("✅ Тестовая рассылка завершена! Проверьте логи.")

@dp.callback_query(lambda c: c.data == "test_now")
async def callback_test_now(callback: CallbackQuery):
    
    user_id = str(callback.from_user.id)
    
    # Получаем текущий час
    moscow_tz = pytz.timezone('Europe/Moscow')
    current_hour = datetime.now(moscow_tz).hour
    
    # Устанавливаем время в базе
    await backend_client.update_settings(user_id, enabled=True, hour=current_hour)
    
    # ТО ЖЕ уведомление что при обычной рассылке
    notification_text = (
        "🔔 Вы не отметили одежду, которую носили сегодня. Это можно сделать тут 👇"
    )
    
    builder = InlineKeyboardBuilder()
    builder.row(
        types.InlineKeyboardButton(
            text="📝 Отметить, что носили сегодня",
            web_app=WebAppInfo(url=f"{MINI_APP_URL}?action=wear_today")
        )
    )
    keyboard = builder.as_markup()
    
    try:
        await callback.bot.send_message(
            user_id,
            notification_text,
            reply_markup=keyboard
        )
        
        await callback.message.edit_text(
            f"✅ **Тестовое уведомление отправлено!**\n\n"
            f"Время установлено на **{current_hour:02d}:00**.\n"
            f"Теперь уведомления будут приходить каждый день в это время.",
            parse_mode="Markdown"
        )
    except Exception as e:
        await callback.message.edit_text(f"❌ Ошибка: {e}")
    
    await callback.answer()

@dp.message(Command("test_notify"))
async def command_test_single(message: types.Message):
    user_id = str(message.from_user.id)
    
    notification_text = (
        "🔔 Вы не отметили одежду, которую носили сегодня. Это можно сделать тут 👇"
    )
    
    builder = InlineKeyboardBuilder()
    builder.row(
        types.InlineKeyboardButton(
            text="📝 Отметить, что носили сегодня",
            web_app=WebAppInfo(url=f"{MINI_APP_URL}?action=wear_today")
        )
    )
    

@dp.message()
async def unknown_message_handler(message: types.Message):
    await message.answer(
        "Я пока понимаю только эти команды:\n\n"
        "/wardrobe — открыть цифровой гардероб \n"
        "/settings — настройки профиля\n"
        "/help — помощь и поддержка"
    )

async def set_bot_commands(bot: Bot):
    commands = [
        types.BotCommand(command="start", description="Запустить бота"),
        types.BotCommand(command="wardrobe", description="Открыть цифровой гардероб"),
        types.BotCommand(command="settings", description="Настройки профиля"),
        types.BotCommand(command="help", description="Помощь и контакты поддержки")
    ]
    await bot.set_my_commands(commands)


async def main():
    proxy_url = os.getenv("PROXY_HOST")
    proxy_auth = BasicAuth(os.getenv("PROXY_USER"), os.getenv("PROXY_PASS"))
    
    bot_session = AiohttpSession(
        proxy=(proxy_url, proxy_auth)
    )
    
    bot = Bot(token=TOKEN, session=bot_session)

    scheduler.add_job(
        send_hourly_notification,
        trigger=CronTrigger(minute=0),
        args=[bot], 
        id="hourly_notification",
        replace_existing=True
    )
    scheduler.start()
    
    await set_bot_commands(bot)
    
    me = await bot.get_me()
    print(f"Бот подключился: @{me.username}")
    
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logging.info("Бот остановлен вручную")