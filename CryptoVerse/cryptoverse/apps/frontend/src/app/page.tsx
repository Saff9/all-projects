'use client';

import React from 'react';
import { MainLayout } from '../components/layout';
import { MiningScreen } from '../components/features';

export default function HomePage() {
  return (
    <MainLayout>
      <MiningScreen />
    </MainLayout>
  );
}
