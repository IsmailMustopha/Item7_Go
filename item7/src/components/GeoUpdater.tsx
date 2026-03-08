'use client'
import { getSocket } from '@/lib/socket'
import React, { useEffect } from 'react'

const GeoUpdater = ({userId}:{userId:string}) => {
  const socket = getSocket()
  socket.emit("identify", userId)
  useEffect(() => {
    if(!userId) return
    if(!navigator.geolocation) return

    const watcher = navigator.geolocation.watchPosition((pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      socket.emit("update-location", {
        userId,
        latitude: lat,
        longitude: lon
      })
    })

    return () => navigator.geolocation.clearWatch(watcher)

  }, [userId])
  return null
}

export default GeoUpdater