// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const api = import.meta.env.VITE_SONG_API?.trim();
  if (!api) throw new Error("未配置 VITE_SONG_API");

  const url = new URL(api, window.location.origin);
  url.searchParams.set("server", server);
  url.searchParams.set("type", type);
  url.searchParams.set("id", id);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let data;
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`音乐接口请求失败：HTTP ${res.status}`);
    data = await res.json();
  } finally {
    clearTimeout(timeout);
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("音乐接口未返回歌曲，请检查接口和歌单是否公开");
  }
  if (data.some((song) => !song || typeof song.url !== "string" || !song.url.trim())) {
    throw new Error("音乐接口返回的歌曲缺少播放地址");
  }

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */

// 获取高德地理位置信息
export const getAdcode = async (key) => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`);
  return await res.json();
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`,
  );
  return await res.json();
};

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
export const getOtherWeather = async () => {
  const res = await fetch("https://api.oioweb.cn/api/weather/GetWeather");
  return await res.json();
};
