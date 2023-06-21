// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import clsx from 'clsx'
import { HeadMetaProps, PageContent } from '../main/PageWrapper'
import { MutedDiv } from '../utils/MutedText'
import styles from './Energy.module.sass'
import EnergyForm from './EnergyForm'
import { FaqSection } from './Faq'

const desc =
  'Energy allows you to use Subsocial. You can create energy here by burning SUB, and see the approximate number of transactions it will allow you to complete.'

const meta: HeadMetaProps = {
  title: 'Energy Station',
  desc,
  image: '/images/energy-preview.png',
}

export const EnergyPage = () => {
  return (
    <PageContent className='mx-5 mt-4' meta={meta}>
      <div className='d-flex justify-content-center'>
        <div className={clsx('SubsocialGradient mb-3', styles.Title)}>Energy Station</div>
      </div>
      <section className={styles.Intro}>
        <MutedDiv>{desc}</MutedDiv>
      </section>
      <EnergyForm />
      <FaqSection />
    </PageContent>
  )
}
