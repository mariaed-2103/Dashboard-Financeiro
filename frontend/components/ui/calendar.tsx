'use client'

import * as React from 'react'
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from 'lucide-react'
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────

type CalendarMode = 'transaction' | 'goal' | 'default'

// ─── Year Picker Overlay ──────────────────────────────────────────────────────

function YearPicker({
                        currentYear,
                        minYear,
                        maxYear,
                        onSelect,
                        onClose,
                    }: {
    currentYear: number
    minYear: number
    maxYear: number
    onSelect: (year: number) => void
    onClose: () => void
}) {
    const years = Array.from(
        { length: maxYear - minYear + 1 },
        (_, i) => minYear + i,
    )
    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const el = scrollRef.current?.querySelector<HTMLElement>('[data-current="true"]')
        el?.scrollIntoView({ block: 'center', behavior: 'instant' })
    }, [])

    return (
        // Backdrop — clicking outside closes
        <div
            className="absolute inset-0 z-20"
            onClick={onClose}
        >
            {/* Panel — stop propagation so clicks inside don't close */}
            <div
                className={cn(
                    'absolute inset-0 flex flex-col',
                    'rounded-[inherit] overflow-hidden',
                    'bg-popover border border-border/60 shadow-xl',
                    'animate-in fade-in-0 zoom-in-95 duration-150',
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 shrink-0">
                    <span className="text-sm font-semibold text-foreground">Escolher ano</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                    >
                        Fechar
                    </button>
                </div>

                {/* Year grid */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-2">
                    <div className="grid grid-cols-3 gap-1.5">
                        {years.map((year) => {
                            const isCurrent = year === currentYear
                            return (
                                <button
                                    key={year}
                                    type="button"
                                    data-current={isCurrent || undefined}
                                    onClick={() => onSelect(year)}
                                    className={cn(
                                        'rounded-lg py-2 text-sm font-medium transition-all duration-100',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                        isCurrent
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                                    )}
                                >
                                    {year}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function Calendar({
                      className,
                      classNames,
                      showOutsideDays = true,
                      captionLayout = 'label',
                      buttonVariant = 'ghost',
                      formatters,
                      components,
                      calendarMode = 'default',
                      ...props
                  }: React.ComponentProps<typeof DayPicker> & {
    buttonVariant?: React.ComponentProps<typeof Button>['variant']
    calendarMode?: CalendarMode
}) {
    const defaultClassNames = getDefaultClassNames()
    const today = new Date()

    // ── Configuração de Limites ─────────────────────────────────────────────
    // Definimos 2026 como base conforme solicitado
    const minYear = 2026
    const maxYear = 2026 + 20 // 2046

    // ── Internal month state ──────────────────────────────────────────────────
    const [displayedMonth, setDisplayedMonth] = React.useState<Date>(() => {
        // Se houver uma data inicial, usamos ela,
        // caso contrário, começamos em Janeiro de 2026 (o novo mínimo)
        const initial = (props.defaultMonth as Date | undefined) ?? (props.month as Date | undefined)
        if (initial && initial.getFullYear() >= minYear) return initial
        return new Date(minYear, 0, 1)
    })

    const [yearPickerOpen, setYearPickerOpen] = React.useState(false)

    // ── Date bounds para o DayPicker ──────────────────────────────────────────
    // Se o modo for 'transaction', o limite superior é hoje (mas note que se hoje for < 2026, isso pode conflitar)
    // Se for 'goal', o limite é o maxYear (2046)
    const toDateBound =
        calendarMode === 'transaction'
            ? today
            : new Date(maxYear, 11, 31)

    // ── Sync controlled `month` prop ──────────────────────────────────────────
    React.useEffect(() => {
        if (props.month) setDisplayedMonth(props.month as Date)
    }, [props.month])

    const handleYearSelect = (year: number) => {
        const next = new Date(displayedMonth)
        next.setFullYear(year)
        setDisplayedMonth(next)
        setYearPickerOpen(false)
        props.onMonthChange?.(next)
    }

    const handleMonthChange = (month: Date) => {
        setDisplayedMonth(month)
        props.onMonthChange?.(month)
    }

    // Caption label shown by react-day-picker (e.g. "março de 2026")
    const captionLabel = displayedMonth.toLocaleString('pt-BR', {
        month: 'long',
        year: 'numeric',
    })
    const captionFormatted =
        captionLabel.charAt(0).toUpperCase() + captionLabel.slice(1)

    return (
        <div className="relative w-fit">
            <DayPicker
                showOutsideDays={showOutsideDays}
                className={cn(
                    'bg-background group/calendar p-3',
                    '[--cell-size:--spacing(8)] sm:[--cell-size:--spacing(9)]',
                    '[[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
                    String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
                    String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
                    className,
                )}
                captionLayout={captionLayout}
                month={displayedMonth}
                onMonthChange={handleMonthChange}
                toDate={toDateBound}
                fromDate={new Date(minYear, 0, 1)}
                formatters={{
                    formatMonthDropdown: (date) =>
                        date.toLocaleString('default', { month: 'short' }),
                    ...formatters,
                }}
                classNames={{
                    root: cn('w-fit', defaultClassNames.root),
                    months: cn(
                        'flex gap-4 flex-col md:flex-row relative',
                        defaultClassNames.months,
                    ),
                    month: cn('flex flex-col w-full gap-4', defaultClassNames.month),
                    nav: cn(
                        'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between',
                        defaultClassNames.nav,
                    ),
                    button_previous: cn(
                        buttonVariants({ variant: buttonVariant }),
                        'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none',
                        defaultClassNames.button_previous,
                    ),
                    button_next: cn(
                        buttonVariants({ variant: buttonVariant }),
                        'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none',
                        defaultClassNames.button_next,
                    ),
                    month_caption: cn(
                        'flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)',
                        defaultClassNames.month_caption,
                    ),
                    caption_label: cn(
                        // Make it invisible — our custom button renders on top
                        'opacity-0 pointer-events-none select-none',
                        captionLayout === 'label' ? 'text-sm' : 'text-sm',
                        defaultClassNames.caption_label,
                    ),
                    table: 'w-full border-collapse',
                    weekdays: cn('flex', defaultClassNames.weekdays),
                    weekday: cn(
                        'text-muted-foreground rounded-md flex-1 font-normal text-[0.75rem] sm:text-[0.8rem] select-none',
                        defaultClassNames.weekday,
                    ),
                    week: cn('flex w-full mt-1.5 sm:mt-2', defaultClassNames.week),
                    week_number_header: cn(
                        'select-none w-(--cell-size)',
                        defaultClassNames.week_number_header,
                    ),
                    week_number: cn(
                        'text-[0.8rem] select-none text-muted-foreground',
                        defaultClassNames.week_number,
                    ),
                    day: cn(
                        'relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none',
                        defaultClassNames.day,
                    ),
                    range_start: cn('rounded-l-md bg-accent', defaultClassNames.range_start),
                    range_middle: cn('rounded-none', defaultClassNames.range_middle),
                    range_end: cn('rounded-r-md bg-accent', defaultClassNames.range_end),
                    today: cn(
                        'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none',
                        defaultClassNames.today,
                    ),
                    outside: cn(
                        'text-muted-foreground aria-selected:text-muted-foreground',
                        defaultClassNames.outside,
                    ),
                    disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
                    hidden: cn('invisible', defaultClassNames.hidden),
                    ...classNames,
                }}
                components={{
                    Root: ({ className, rootRef, ...props }) => (
                        <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
                    ),
                    Chevron: ({ className, orientation, ...props }) => {
                        if (orientation === 'left')
                            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />
                        if (orientation === 'right')
                            return <ChevronRightIcon className={cn('size-4', className)} {...props} />
                        return <ChevronDownIcon className={cn('size-4', className)} {...props} />
                    },
                    DayButton: CalendarDayButton,
                    WeekNumber: ({ children, ...props }) => (
                        <td {...props}>
                            <div className="flex size-(--cell-size) items-center justify-center text-center">
                                {children}
                            </div>
                        </td>
                    ),
                    ...components,
                }}
                {...props}
            />

            {/* ── Custom caption button — absolutely positioned over the hidden label ── */}
            {/*
                Sits in the nav row at the top of the calendar.
                height = --cell-size, padded by --cell-size on each side (same as month_caption).
                pointer-events-none on itself so the nav prev/next buttons remain clickable;
                the inner button captures clicks.
            */}
            <div
                aria-hidden="true"
                className={cn(
                    'pointer-events-none',
                    'absolute top-3 left-3 right-3',       // match DayPicker padding (p-3)
                    'flex items-center justify-center',
                    'h-[--cell-size]',
                    // Reserve space for prev/next buttons
                    'px-[--cell-size]',
                )}
                style={{
                    // Fallback in case CSS var isn't resolved at paint time
                    height: 'calc(var(--cell-size, 2rem))',
                    paddingLeft: 'calc(var(--cell-size, 2rem) + 4px)',
                    paddingRight: 'calc(var(--cell-size, 2rem) + 4px)',
                }}
            >
                <button
                    type="button"
                    aria-hidden="false"
                    onClick={() => setYearPickerOpen((v) => !v)}
                    className={cn(
                        'pointer-events-auto',
                        'flex items-center gap-1.5 rounded-md px-2 py-1',
                        'text-sm font-semibold text-foreground select-none',
                        'transition-colors hover:bg-muted',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                    title="Clique para escolher o ano"
                >
                    <span>{captionFormatted}</span>
                    <ChevronDownIcon
                        className={cn(
                            'size-3.5 text-muted-foreground transition-transform duration-200',
                            yearPickerOpen && 'rotate-180',
                        )}
                    />
                </button>
            </div>

            {/* ── Year picker overlay ───────────────────────────────────────── */}
            {yearPickerOpen && (
                <YearPicker
                    currentYear={displayedMonth.getFullYear()}
                    minYear={minYear}
                    maxYear={maxYear}
                    onSelect={handleYearSelect}
                    onClose={() => setYearPickerOpen(false)}
                />
            )}
        </div>
    )
}

// ─── Day Button ───────────────────────────────────────────────────────────────

function CalendarDayButton({
                               className,
                               day,
                               modifiers,
                               ...props
                           }: React.ComponentProps<typeof DayButton>) {
    const defaultClassNames = getDefaultClassNames()
    const ref = React.useRef<HTMLButtonElement>(null)

    React.useEffect(() => {
        if (modifiers.focused) ref.current?.focus()
    }, [modifiers.focused])

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            data-day={day.date.toLocaleDateString()}
            data-selected-single={
                modifiers.selected &&
                !modifiers.range_start &&
                !modifiers.range_end &&
                !modifiers.range_middle
            }
            data-range-start={modifiers.range_start}
            data-range-end={modifiers.range_end}
            data-range-middle={modifiers.range_middle}
            className={cn(
                'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground',
                'data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground',
                'data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground',
                'data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground',
                'group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50',
                'dark:hover:text-accent-foreground',
                'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal',
                'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px]',
                'data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md',
                'data-[range-middle=true]:rounded-none',
                'data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md',
                'text-xs sm:text-sm',
                '[&>span]:text-xs [&>span]:opacity-70',
                defaultClassNames.day,
                className,
            )}
            {...props}
        />
    )
}

export { Calendar, CalendarDayButton }