import React from 'react';

type Props = { params: { teamId: string } };

export default function TeamPage({ params }: Props) {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<h1 className="text-2xl font-semibold">Team {params.teamId}</h1>
		</div>
	);
}

