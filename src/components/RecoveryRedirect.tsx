'use client';

import { useEffect } from 'react';

export function RecoveryRedirect(){
  useEffect(()=>{
    const hash=window.location.hash||'';
    if(!hash)return;
    const params=new URLSearchParams(hash.replace(/^#/,''));
    if(params.get('type')==='recovery'&&params.get('access_token')){
      window.location.replace(`/account/reset-password${hash}`);
    }
  },[]);
  return null;
}
