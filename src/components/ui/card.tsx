import * as React from 'react'
import { cn } from '@/utils/utils'

const cardBase =
  'flex w-full flex-col gap-6 rounded-xl border bg-white p-6 text-gray-900 dark:border-slate-700 dark:bg-gray-800 dark:text-gray-100'
const cardHeaderBase = 'flex flex-col space-y-1.5'
const cardTitleBase = 'text-lg leading-none font-semibold tracking-tight'
const cardDescriptionBase = 'text-sm text-gray-500 dark:text-gray-400'
const cardActionBase =
  'col-start-2 row-span-2 row-start-1 self-start justify-self-end'
const cardContentBase = ''
const cardFooterBase = 'flex items-center [.border-t]:pt-6'

const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card"
    className={cn(cardBase, className)}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn(cardHeaderBase, className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-title"
    className={cn(cardTitleBase, className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-description"
    className={cn(cardDescriptionBase, className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-action"
    className={cn(cardActionBase, className)}
    {...props}
  />
))
CardAction.displayName = 'CardAction'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn(cardContentBase, className)}
    {...props}
  />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn(cardFooterBase, className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
