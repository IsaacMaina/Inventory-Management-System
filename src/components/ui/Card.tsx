import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = ({ className, ...props }: CardProps) => (
  <div
    className={`rounded-xl bg-card text-card-foreground shadow card-hover ${className}`}
    {...props}
  />
);

const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);

const CardTitle = ({ className, ...props }: CardTitleProps) => (
  <h3
    className={`font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
);

const CardDescription = ({ className, ...props }: CardDescriptionProps) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props} />
);

const CardContent = ({ className, ...props }: CardContentProps) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent };