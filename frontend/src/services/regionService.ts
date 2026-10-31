// Service untuk fetch data wilayah Indonesia dari API
// API: https://emsifa.github.io/api-wilayah-indonesia

import { provincesFallback } from '../utils/provincesData';

// Try multiple possible API endpoints
const API_BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';
const API_BASE_URL_ALT = 'https://www.emsifa.com/api-wilayah-indonesia/api';
// Alternative: wilayah.id API
const API_WILAYAH_ID = 'https://wilayah.id/api';

export interface Region {
  id: string;
  name: string;
}

export interface Province extends Region {}
export interface Regency extends Region {}
export interface District extends Region {}
export interface Village extends Region {}

export const regionService = {
  /**
   * Fetch semua provinsi
   */
  async getProvinces(): Promise<Province[]> {
    // Try primary URL first
    let url = `${API_BASE_URL}/provinces.json`;
    let error: any = null;
    
    try {
      console.log('Fetching provinces from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      });
      
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log('Response text length:', text.length);
      console.log('Response text preview:', text.substring(0, 200));
      
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response');
      }
      
      console.log('Raw API response type:', typeof data, 'Is array:', Array.isArray(data));
      console.log('Raw API response keys:', Object.keys(data).slice(0, 5));
      
      // Handle both object and array formats
      let provincesArray: Province[] = [];
      
      if (Array.isArray(data)) {
        // If API returns array directly
        provincesArray = data.map((item: any) => ({
          id: item.id || item.code || String(item.id),
          name: item.name || item.nama || String(item)
        }));
      } else if (typeof data === 'object' && data !== null) {
        // If API returns object with keys as IDs
        provincesArray = Object.keys(data)
          .map(id => ({
            id,
            name: data[id]
          }));
      }
      
      // Sort by name
      provincesArray.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log('✅ Formatted provinces:', provincesArray.length, 'items');
      if (provincesArray.length > 0) {
        console.log('First 3 provinces:', provincesArray.slice(0, 3));
      }
      
      return provincesArray;
    } catch (primaryError: any) {
      console.error('❌ Primary API failed:', primaryError);
      error = primaryError;
      
      // Try alternative URL
      try {
        url = `${API_BASE_URL_ALT}/provinces.json`;
        console.log('Trying alternative URL:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const provincesArray = Object.keys(data)
          .map(id => ({
            id,
            name: data[id]
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('✅ Alternative API worked! Loaded', provincesArray.length, 'provinces');
        return provincesArray;
      } catch (altError) {
        console.error('❌ Alternative API also failed:', altError);
        console.warn('⚠️ Using fallback static data for provinces');
        // Return fallback data instead of throwing error
        return provincesFallback.map(p => ({ id: p.id, name: p.name }));
      }
    }
  },

  /**
   * Fetch kabupaten/kota berdasarkan ID provinsi
   */
  async getRegenciesByProvince(provinceId: string): Promise<Regency[]> {
    // Try multiple API sources
    const urls = [
      `${API_BASE_URL}/regencies/${provinceId}.json`,
      `${API_BASE_URL_ALT}/regencies/${provinceId}.json`,
    ];
    
    for (const url of urls) {
      try {
        console.log('Fetching regencies from:', url);
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn(`Response not OK for ${url}:`, response.status);
          continue; // Try next URL
        }
        
        const text = await response.text();
        if (!text || text.trim() === '') {
          console.warn(`Empty response from ${url}`);
          continue;
        }
        
        let data: any;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error for regencies:', parseError);
          continue; // Try next URL
        }
        
        // Handle both object and array formats
        let regenciesArray: Regency[] = [];
        
        if (Array.isArray(data)) {
          regenciesArray = data.map((item: any) => ({
            id: String(item.id || item.code || item.kode || item.id),
            name: String(item.name || item.nama || item.name || '')
          })).filter(item => item.name !== '');
        } else if (typeof data === 'object' && data !== null) {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            regenciesArray = keys.map(id => ({
              id: String(id),
              name: String(data[id])
            })).filter(item => item.name !== '');
          }
        }
        
        if (regenciesArray.length > 0) {
          regenciesArray.sort((a, b) => a.name.localeCompare(b.name));
          console.log('✅ Loaded regencies:', regenciesArray.length, 'for province', provinceId, 'from', url);
          return regenciesArray;
        } else {
          console.warn(`No regencies found in response from ${url}`);
          continue; // Try next URL
        }
      } catch (error: any) {
        console.error(`Error fetching from ${url}:`, error.message);
        continue; // Try next URL
      }
    }
    
    // All URLs failed
    console.error('❌ All API sources failed for regencies');
    throw new Error('Gagal mengambil data kabupaten/kota dari semua sumber API');
  },

  /**
   * Fetch kecamatan berdasarkan ID kabupaten/kota
   */
  async getDistrictsByRegency(regencyId: string): Promise<District[]> {
    // Try multiple API sources
    const urls = [
      `${API_BASE_URL}/districts/${regencyId}.json`,
      `${API_BASE_URL_ALT}/districts/${regencyId}.json`,
    ];
    
    for (const url of urls) {
      try {
        console.log('Fetching districts from:', url);
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn(`Response not OK for ${url}:`, response.status);
          continue;
        }
        
        const text = await response.text();
        if (!text || text.trim() === '') {
          console.warn(`Empty response from ${url}`);
          continue;
        }
        
        let data: any;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error for districts:', parseError);
          continue;
        }
        
        // Handle both object and array formats
        let districtsArray: District[] = [];
        
        if (Array.isArray(data)) {
          districtsArray = data.map((item: any) => ({
            id: String(item.id || item.code || item.kode || item.id),
            name: String(item.name || item.nama || item.name || '')
          })).filter(item => item.name !== '');
        } else if (typeof data === 'object' && data !== null) {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            districtsArray = keys.map(id => ({
              id: String(id),
              name: String(data[id])
            })).filter(item => item.name !== '');
          }
        }
        
        if (districtsArray.length > 0) {
          districtsArray.sort((a, b) => a.name.localeCompare(b.name));
          console.log('✅ Loaded districts:', districtsArray.length, 'for regency', regencyId, 'from', url);
          return districtsArray;
        } else {
          console.warn(`No districts found in response from ${url}`);
          continue;
        }
      } catch (error: any) {
        console.error(`Error fetching from ${url}:`, error.message);
        continue;
      }
    }
    
    console.error('❌ All API sources failed for districts');
    throw new Error('Gagal mengambil data kecamatan dari semua sumber API');
  },

  /**
   * Fetch kelurahan/desa berdasarkan ID kecamatan
   */
  async getVillagesByDistrict(districtId: string): Promise<Village[]> {
    // Try multiple API sources
    const urls = [
      `${API_BASE_URL}/villages/${districtId}.json`,
      `${API_BASE_URL_ALT}/villages/${districtId}.json`,
    ];
    
    for (const url of urls) {
      try {
        console.log('Fetching villages from:', url);
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn(`Response not OK for ${url}:`, response.status);
          continue;
        }
        
        const text = await response.text();
        if (!text || text.trim() === '') {
          console.warn(`Empty response from ${url}`);
          continue;
        }
        
        let data: any;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error for villages:', parseError);
          continue;
        }
        
        // Handle both object and array formats
        let villagesArray: Village[] = [];
        
        if (Array.isArray(data)) {
          villagesArray = data.map((item: any) => ({
            id: String(item.id || item.code || item.kode || item.id),
            name: String(item.name || item.nama || item.name || '')
          })).filter(item => item.name !== '');
        } else if (typeof data === 'object' && data !== null) {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            villagesArray = keys.map(id => ({
              id: String(id),
              name: String(data[id])
            })).filter(item => item.name !== '');
          }
        }
        
        if (villagesArray.length > 0) {
          villagesArray.sort((a, b) => a.name.localeCompare(b.name));
          console.log('✅ Loaded villages:', villagesArray.length, 'for district', districtId, 'from', url);
          return villagesArray;
        } else {
          console.warn(`No villages found in response from ${url}`);
          continue;
        }
      } catch (error: any) {
        console.error(`Error fetching from ${url}:`, error.message);
        continue;
      }
    }
    
    console.error('❌ All API sources failed for villages');
    throw new Error('Gagal mengambil data kelurahan/desa dari semua sumber API');
  }
};

